import { LoggerFactory } from "../logger/LoggerFactory";
import express from "express";
import { UserAuthentication } from "../middleware/UserAuthentication";
import Controller from "./Controller";
import { injectable } from "inversify";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { Wayfair } from "../scrapers/Wayfair";
import { AddRegistryDTO } from "../dto/registry/AddRegistryDto";
import { validateBody } from "../middleware/validation";
import RegistryDal from "../dal/registry/RegistryDal";
import ServerException from "../exceptions/ServerException";
import ClientException from "../exceptions/ClientException";

@injectable()
export default class UserController implements Controller {
    public path = "/registry";
    public router = express.Router();
    private logger = LoggerFactory.getLogger(module);

    private wayfairScraper: Wayfair;
    private registryDal: RegistryDal;
    private auth: UserAuthentication;

    constructor(auth: UserAuthentication, registryDal: RegistryDal, wayfairScraper: Wayfair) {
        this.auth = auth;
        this.registryDal = registryDal;
        this.wayfairScraper = wayfairScraper;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/", this.auth.authenticate, this.auth.withUser(this.getRegistry));
        this.router.post("/", this.auth.authenticate, validateBody(AddRegistryDTO), this.auth.withUser(this.addRegistry));
    }

    getRegistry = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        try {
            const registryUrlResponse = await this.registryDal.getRegistry(user.id);
            if (!registryUrlResponse) {
                next(new ClientException(`User has no registry`));
                return;
            }
            const products = await this.wayfairScraper.scrape(registryUrlResponse.url, user.id);
            response.json(products);
        } catch (error) {
            this.logger.error(`Error getting registry`, { error });
            next(new ServerException("Error getting registry"));
        }
    };

    addRegistry = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const { registryUrl, registrySource } = request.body as AddRegistryDTO;

        try {
            await this.registryDal.addRegistry(user.id, registryUrl, registrySource);
            this.logger.info(`Success adding registry ${registryUrl} from ${registrySource} for user ${user.username}`);
            response.status(200).json({});
        } catch (error) {
            this.logger.error(`Error adding registry`, { error });
            next(new ServerException("Error adding registry"));
        }
    };
}
