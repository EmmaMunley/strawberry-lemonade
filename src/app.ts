import express from "express";
import Controller from "./controllers/Controller";
import errorHandler from "./middleware/ErrorHandler";
import cookieParser from "cookie-parser";
import UserController from "./controllers/UserController";
import MoodController from "./controllers/MoodController";
import PostController from "./controllers/PostController";
import CommunityController from "./controllers/CommunityController";
import { AppConfiguration } from "./config/Configuration";
import { Database } from "./database/Database";
import { injectable } from "inversify";
import { LoggerFactory } from "./logger/LoggerFactory";
import { createHttpLoggerMiddleware } from "./middleware/HttpLogger";
import { UserAuthentication } from "./middleware/UserAuthentication";
import MoodAggregator from "./workers/mood/Aggregator";
import { Server } from "http";
import { AddressInfo } from "net";
import { Logger } from "winston";

@injectable()
class App {
    private app: express.Application;
    private server?: Server;
    public appName: string;
    private port: number | string;
    private database: Database;
    private auth: UserAuthentication;
    private moodAggregator: MoodAggregator;
    private logger: Logger;

    private controllers: Controller[];

    constructor(
        userController: UserController,
        moodController: MoodController,
        communityController: CommunityController,
        postController: PostController,
        config: AppConfiguration,
        database: Database,
        auth: UserAuthentication,
        moodAggregator: MoodAggregator,
        loggerFactory: LoggerFactory,
    ) {
        this.controllers = [userController, moodController, communityController, postController];
        const configData = config.get();
        this.port = configData.port;
        this.appName = configData.application.name;
        this.app = express();
        this.database = database;
        this.auth = auth;
        this.moodAggregator = moodAggregator;
        this.logger = loggerFactory.getLogger(module);
    }

    public async startServer(): Promise<void> {
        try {
            await this.database.initialize();
            this.initializeMiddlewares();
            this.initializePing();
            this.initializeControllers(this.controllers);
            this.initializeErrorHandling();
            this.initializeMoodAggregator();
            await this.listen();
        } catch (error) {
            this.logger.error(`Error initializing database: ${error}`);
            process.exit(0);
        }
    }

    private initializeMiddlewares(): void {
        this.app.use(createHttpLoggerMiddleware(this.appName));
        this.app.use(cookieParser());
        this.app.use(express.json());
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });
    }

    private initializeMoodAggregator(): void {
        this.moodAggregator.start();
    }

    private initializePing(): void {
        this.app.get("/ping", (_, res) => res.send("Pong!"));
        this.app.get("/auth", this.auth.authenticate, (_, res) => res.send("You're authed and ready to rock and roll!"));
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private async listen(): Promise<void> {
        this.server = await this.app.listen(this.port);
        this.logger.info(`Server listening on port ${this.getServerPort()}`);
    }

    public getServerPort(): number | null {
        const address = this.server?.address();
        if (this.isAddressInfo(address)) {
            return address.port;
        } else {
            throw new Error("Invalid address info -- is server running?");
        }
    }

    private isAddressInfo(address: string | null | undefined | AddressInfo): address is AddressInfo {
        return typeof address === "object";
    }

    public async stopServer(): Promise<void> {
        try {
            await this.database.close();
            this.moodAggregator.stop();
            if (this.server) {
                await new Promise((resolve, reject) => {
                    this.server?.close(error => {
                        error ? reject(error) : resolve();
                    });
                });
            }
        } catch (error) {
            this.logger.error(`Error shutting down server or database`, { error });
        }
    }
}

export default App;
