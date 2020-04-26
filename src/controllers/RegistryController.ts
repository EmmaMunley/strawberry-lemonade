import { LoggerFactory } from "../logger/LoggerFactory";
import express from "express";
import { UserAuthentication } from "../middleware/UserAuthentication";
import Controller from "./Controller";
import { injectable } from "inversify";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { Wayfair } from "../scrapers/Wayfair";

@injectable()
export default class UserController implements Controller {
    public path = "/registry";
    public router = express.Router();
    private logger = LoggerFactory.getLogger(module);

    private wayfairScraper: Wayfair;
    private auth: UserAuthentication;

    constructor(auth: UserAuthentication, wayfairScraper: Wayfair) {
        this.auth = auth;
        this.wayfairScraper = wayfairScraper;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/", this.auth.authenticate, this.auth.withUser(this.getRegistry));
    }

    getRegistry = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const url = request.body.url;
        const products = await this.wayfairScraper.scrape(url, user.id);

        response.json(products);
    };
}
