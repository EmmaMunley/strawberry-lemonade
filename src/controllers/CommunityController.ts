import express from "express";
import Controller from "./Controller";
import { validateBody, validateParams } from "../middleware/Validation";
import { CreateCommunityDTO } from "../dto/community/CreateCommunityDto";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { NewCommunity, Community, CommunityId } from "../types/community/Community";
import { UserDetails } from "../types/user/User";
import { ErrorResponse } from "../error/ErrorResponses";
import { LoggerFactory } from "../logger/LoggerFactory";
import ServerException from "../exceptions/ServerException";
import ClientException from "../exceptions/ClientException";
import { CommunityDal, MoodDal, PostDal, MemberDal } from "../dal";
import { injectable } from "inversify";
import { UserAuthentication } from "../middleware/UserAuthentication";
import { Either, isRight } from "fp-ts/lib/Either";
import { Logger } from "winston";
import { parseNumberOrDefault } from "../utils/parsing";
import { AppConfiguration } from "../config/Configuration";
import ErrorCodes from "../error/ErrorCodes";

@injectable()
export default class CommunityController implements Controller {
    public path = "/community";
    public router = express.Router();
    private communityDal: CommunityDal;
    private moodDal: MoodDal;
    private postDal: PostDal;
    private memberDal: MemberDal;
    private auth: UserAuthentication;
    private logger: Logger;
    private maxCommunitiesPerFetch: number;

    constructor(
        communityDal: CommunityDal,
        moodDal: MoodDal,
        postDal: PostDal,
        memberDal: MemberDal,
        auth: UserAuthentication,
        config: AppConfiguration,
        loggerFactory: LoggerFactory,
    ) {
        this.communityDal = communityDal;
        this.moodDal = moodDal;
        this.postDal = postDal;
        this.memberDal = memberDal;
        this.auth = auth;
        this.logger = loggerFactory.getLogger(module);
        this.maxCommunitiesPerFetch = config.get().communities.maxCommunitiesPerFetch;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/", this.auth.authenticate, this.auth.withUser(this.getCommunitiesForUser));
        this.router.get("/trending", this.auth.authenticate, this.auth.withUser(this.getTrendingCommunities));
        this.router.put("/:communityId/join", validateParams(CommunityId), this.auth.authenticate, this.auth.withUser(this.joinCommunity));
        this.router.put("/:communityId/leave", validateParams(CommunityId), this.auth.authenticate, this.auth.withUser(this.leaveCommunity));
        this.router.post("/", this.auth.authenticate, validateBody(CreateCommunityDTO), this.auth.withUser(this.createCommunity));
    }

    createCommunity = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user: UserDetails = request.user;
        const createCommunityRequest: CreateCommunityDTO = request.body;
        const createCommunity: NewCommunity = {
            ...createCommunityRequest,
            ownerId: user.id,
        };
        try {
            const data: Either<ErrorResponse, Community> = await this.communityDal.createCommunity(createCommunity);
            if (isRight(data)) {
                const community = data.right;
                this.logger.info(`Created community: ${JSON.stringify(community)}`);
                response.status(200).json(community);
            } else {
                const error = data.left;
                next(new ClientException(error.message, error.errorCodes));
            }
        } catch (error) {
            const errorMsg = `Error creating new community: ${JSON.stringify(createCommunity)}`;
            this.logger.error(errorMsg, { error });
            next(new ServerException(errorMsg));
        }
    };

    getCommunitiesForUser = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user: UserDetails = request.user;
        try {
            const communities = await this.communityDal.getCommunitiesForUser(user.id);
            response.status(200).json(communities);
        } catch (error) {
            this.logger.error(`Error getting communities for user ${user}`, { error });
            next(new ServerException(`Error getting communities for userId: ${user.id}`));
        }
    };

    getTrendingCommunities = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const { query, user } = request;
        const offset = parseNumberOrDefault(query.offset, 0);
        let limit = parseNumberOrDefault(query.limit, this.maxCommunitiesPerFetch);
        // Don't exceed max amount per fetch
        limit = Math.min(limit, this.maxCommunitiesPerFetch);
        try {
            const trendingCommunities = await this.communityDal.getTrendingCommunities(user.id, limit, offset);
            response.status(200).json(trendingCommunities);
        } catch (error) {
            this.logger.error(`Error getting trending communities`, { error });
            next(new ServerException(`Error getting trending communities`));
        }
    };

    joinCommunity = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const { communityId } = request.body as CommunityId;
        try {
            const isMember = await this.memberDal.isMember(user.id, communityId);
            if (isMember) {
                next(new ClientException(`User already in community`, [ErrorCodes.userAlreadyInCommunity]));
            } else {
                await this.memberDal.joinCommunity(user.id, communityId);
                response.status(200).json({});
            }
        } catch (error) {
            this.logger.error(`Error joining community for userId: ${user.id}, communityId: ${communityId}`, { error });
            next(new ServerException(`Error joining community`));
        }
    };

    // todo URGENT: don't allow owners to leave communities -- only disband
    leaveCommunity = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const { communityId } = request.body as CommunityId;
        try {
            const isMember = await this.memberDal.isMember(user.id, communityId);
            if (!isMember) {
                next(new ClientException(`User not in community`, [ErrorCodes.userNotInCommunity]));
            } else {
                await this.memberDal.leaveCommunity(user.id, communityId);
                response.status(200).json({});
            }
        } catch (error) {
            this.logger.error(`Error leaving community for userId: ${user.id}, communityId: ${communityId}`, { error });
            next(new ServerException(`Error leaving community`));
        }
    };
}
