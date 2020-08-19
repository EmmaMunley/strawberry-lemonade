import { LoggerFactory } from "../logger/LoggerFactory";
import express from "express";
import { UserAuthentication } from "../middleware/UserAuthentication";
import Controller from "./Controller";
import { injectable } from "inversify";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { CreateRegistryDTO } from "../dto/registry/CreateRegistryDto";
import { validateBody } from "../middleware/validation";
import ServerException from "../exceptions/ServerException";
import { DeleteRegistryDTO } from "../dto/registry/DeleteRegistryDto";
import RegistryDal from "../dal/registry/RegistryDal";
import NotFoundException from "../exceptions/NotFoundException";
import RegistryPartnerDal from "../dal/registry_partner/RegistryPartnerDal";
import { GetRegistrySourceItemsDto } from "../dto/registry/GetRegistrySourceItemsDto";
import Scrapers from "../scrapers/Scrapers";
import { Scraper } from "../scrapers/Scraper";
import { isLeft } from "fp-ts/lib/Either";

@injectable()
export default class UserController implements Controller {
    public path = "/registry";
    public router = express.Router();
    private logger = LoggerFactory.getLogger(module);

    private registryDal: RegistryDal;
    private registryPartnerDal: RegistryPartnerDal;
    private auth: UserAuthentication;
    private scrapers: Scrapers;

    constructor(
        auth: UserAuthentication,
        registryDal: RegistryDal,
        registryPartnerDal: RegistryPartnerDal,
        scrapers: Scrapers,
    ) {
        this.auth = auth;
        this.registryDal = registryDal;
        this.registryPartnerDal = registryPartnerDal;
        this.scrapers = scrapers;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/", this.auth.authenticate, this.auth.withUser(this.getRegistry));
        this.router.get(
            "/source",
            this.auth.authenticate,
            validateBody(GetRegistrySourceItemsDto),
            this.auth.withUser(this.getRegistrySourceItems),
        );
        this.router.post(
            "/",
            this.auth.authenticate,
            validateBody(CreateRegistryDTO),
            this.auth.withUser(this.createRegistry),
        );
        this.router.delete(
            "/",
            this.auth.authenticate,
            validateBody(DeleteRegistryDTO),
            this.auth.withUser(this.deleteRegistry),
        );
    }

    getRegistry = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        const user = request.user;
        try {
            const registry = await this.registryDal.getRegistry(user.id);
            if (registry === undefined) {
                const errorMsg = `Registry not found for user ${user.id}`;
                this.logger.error(errorMsg);
                next(new NotFoundException(errorMsg));
            } else {
                response.json(registry);
            }
        } catch (error) {
            this.logger.error(`Error getting registry`, { error });
            next(new ServerException("Error getting registry"));
        }
    };

    getRegistrySourceItems = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        const user = request.user;
        const sourceUrl = request.body as GetRegistrySourceItemsDto;

        try {
            const getItemsResponse = await this.scrapers.getRegistryItemsWithoutFallback(user.id, sourceUrl);
            if (isLeft(getItemsResponse)) {
                throw new Error(getItemsResponse.left.message);
            }
            response.status(200).json(getItemsResponse.right);
        } catch (error) {
            this.logger.error(`Error getting registry items for ${JSON.stringify(sourceUrl)} for user ${user.id}`, {
                error,
            });
            next(new ServerException("Error getting registry items"));
        }
    };

    createRegistry = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        const user = request.user;
        const createRegistryRequest = request.body as CreateRegistryDTO;

        try {
            const createRegistryResponse = await this.registryDal.createRegistry(user.id, createRegistryRequest);
            this.logger.info(`Success creating registry ${createRegistryResponse.registryId} for user ${user.id}`);
            response.status(201).json(createRegistryResponse);
        } catch (error) {
            this.logger.error(`Error creating registry for user ${user.id}`, { error });
            next(new ServerException("Error creating registry"));
        }
    };

    deleteRegistry = async (
        request: RequestWithUser,
        response: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        const user = request.user;
        const { source, registryId } = request.body as DeleteRegistryDTO;

        try {
            await this.registryPartnerDal.deleteRegistryPartner(user.id, registryId, source);
            response.status(200).json({});
        } catch (error) {
            this.logger.error(`Error deleting registry`, { error });
            next(new ServerException("Error deleting registry"));
        }
    };
}
