import express from "express";
import Controller from "./Controller";
import { UserAuthentication } from "../middleware/UserAuthentication";
import { validateParams } from "../middleware/Validation";
import { LoggerFactory } from "../logger/LoggerFactory";
import ServerException from "../exceptions/ServerException";
import { MoodDal } from "../dal";
import { injectable } from "inversify";
import { GetHistoryDTO } from "../dto/mood/GetHistoryDto";
import { Logger } from "winston";

@injectable()
export default class MoodController implements Controller {
    public path = "/mood";
    public router = express.Router();
    private moodDal: MoodDal;
    private auth: UserAuthentication;
    private logger: Logger;

    constructor(moodDal: MoodDal, auth: UserAuthentication, loggerFactory: LoggerFactory) {
        this.moodDal = moodDal;
        this.auth = auth;
        this.logger = loggerFactory.getLogger(module);
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/history/:communityId", this.auth.authenticate, validateParams(GetHistoryDTO), this.getCommunityMoodHistory);
    }

    getCommunityMoodHistory = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {
        const getHistoryRequest = request.params as GetHistoryDTO;
        try {
            const history = await this.moodDal.getCommunityMoodHistory(getHistoryRequest.communityId);
            response.status(200).json(history);
        } catch (error) {
            this.logger.error(`Error fetching mood history for communityId ${getHistoryRequest.communityId}`, { error });
            next(new ServerException(`Error fetching mood history for communityId ${getHistoryRequest.communityId}`));
        }
    };
}
