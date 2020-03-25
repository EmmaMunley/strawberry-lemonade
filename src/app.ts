import express from "express";
import Controller from "./controllers/Controller";
import errorHandler from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import { UserController, RegistryController } from "./controllers";
import { AppConfiguration } from "./config/Configuration";
import { Database } from "./database/db";
import { injectable } from "inversify";
import { LoggerFactory } from "./logger/LoggerFactory";
import { createHttpLoggerMiddleware } from "./middleware/httpLogger";
import { UserAuthentication } from "./middleware/UserAuthentication";

@injectable()
class App {
    public app: express.Application;
    public appName: string;
    public port: number | string;
    public database: Database;
    private auth: UserAuthentication;
    private logger = LoggerFactory.getLogger(module);

    private controllers: Controller[];

    constructor(
        userController: UserController,
        registryController: RegistryController,
        config: AppConfiguration,
        database: Database,
        auth: UserAuthentication,
    ) {
        this.controllers = [userController, registryController];
        const configData = config.get();
        this.port = configData.port;
        this.appName = configData.application.name;
        this.app = express();
        this.database = database;
        this.auth = auth;
    }

    public startServer(): void {
        this.database
            .initializeDatabase()
            .then(() => {
                this.initializeMiddlewares();
                this.initializePing();
                this.initializeControllers();
                this.initializeErrorHandling();
                this.listen();
            })
            .catch(error => {
                this.logger.error(`Error initializing database: ${error}`);
                process.exit(0);
            });
    }

    private initializeMiddlewares(): void {
        this.app.use(createHttpLoggerMiddleware(this.appName));
        this.app.use(cookieParser());
        this.app.use(express.json());
    }

    private initializeControllers(): void {
        this.controllers.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });
    }

    private initializePing(): void {
        this.app.get("/ping", (_, res) => res.send("Pong!"));
        this.app.get("/auth", this.auth.authenticate, (_, res) => res.send("You're authed and ready to rock and roll!"));
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private listen(): void {
        this.app.listen(this.port, () => {
            this.logger.info(`Server listening on port ${this.port}`);
        });
    }
}

export default App;
