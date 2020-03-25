import { LoggerFactory } from "../logger/LoggerFactory";
import express from "express";
import { UserAuthentication } from "../middleware/UserAuthentication";
import Controller from "./Controller";
import { injectable } from "inversify";
import { RequestWithUser } from "../types/request/RequestWithUser";

@injectable()
export default class UserController implements Controller {
    public path = "/registry";
    public router = express.Router();
    private logger = LoggerFactory.getLogger(module);

    private auth: UserAuthentication;

    constructor(auth: UserAuthentication) {
        this.auth = auth;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/", this.auth.authenticate, this.auth.withUser(this.getRegistry));
    }

    getRegistry = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        this.logger.info(`User ${request.user.username} is requesting their registry`);
        response.json(["d1", "d2", "d3"]);
    };
}
