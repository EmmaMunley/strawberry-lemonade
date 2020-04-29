import express from "express";
import Controller from "./Controller";
import { UserAuthentication } from "../middleware/UserAuthentication";
import { validateBody, validateParams } from "../middleware/Validation";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { LoggerFactory } from "../logger/LoggerFactory";
import ServerException from "../exceptions/ServerException";
import MemberDal from "../dal/member/MemberDal";
import { userNotInCommunity } from "../error/ErrorResponses";
import { injectable } from "inversify";
import { NewPost, PostId } from "../types/post/Post";
import { CommunityId } from "../types/community/Community";
import { SubmitPostDTO } from "../dto/post/SubmitPostDto";
import { AppConfiguration } from "../config/Configuration";
import PostDal from "../dal/post/PostDal";
import { ImageManager } from "../images/ImageManager";
import NotFoundException from "../exceptions/NotFoundException";
import { parseNumberOrDefault } from "../utils/parsing";
import { UserIdParam } from "../types/user/User";
import { LikePostDTO } from "../dto/post/LikePostDto";
import { optionalFile } from "../middleware/ImageUpload";
import { isSubset } from "../utils/set";
import { Logger } from "winston";

@injectable()
export default class PostController implements Controller {
    public path = "/post";
    public router = express.Router();
    private memberDal: MemberDal;
    private postDal: PostDal;
    private auth: UserAuthentication;
    private maxPostsPerFetch: number;
    private imageManager: ImageManager;
    private POST_IMAGE_FILE = "image";
    private logger: Logger;

    constructor(
        memberDal: MemberDal,
        postDal: PostDal,
        imageManager: ImageManager,
        auth: UserAuthentication,
        config: AppConfiguration,
        loggerFactory: LoggerFactory,
    ) {
        this.memberDal = memberDal;
        this.postDal = postDal;
        this.auth = auth;
        this.imageManager = imageManager;
        this.maxPostsPerFetch = config.get().posts.maxPostsPerFetch;
        this.logger = loggerFactory.getLogger(module);

        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.post(
            "/",
            this.auth.authenticate,
            optionalFile(this.POST_IMAGE_FILE),
            validateBody(SubmitPostDTO),
            this.auth.withUser(this.createPost),
        );
        this.router.get("/community/:communityId", this.auth.authenticate, validateParams(CommunityId), this.auth.withUser(this.getCommunityPosts));
        this.router.get("/user/:userId", this.auth.authenticate, validateParams(UserIdParam), this.getUserPosts);
        this.router.get("/:postId/image", this.auth.authenticate, validateParams(PostId), this.auth.withUser(this.getPostImage));
        this.router.post("/like", this.auth.authenticate, validateBody(LikePostDTO), this.auth.withUser(this.likePost));
    }

    createPost = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const post: SubmitPostDTO = request.body;
        try {
            const userId = user.id;
            const moodValue = post.moodValue;
            const postCommunityIds = post.communityIds;
            const userCommunityIds = await this.memberDal.getUserMemberships(userId);
            const isMember = isSubset(postCommunityIds, userCommunityIds);
            if (!isMember) {
                response.status(400).json(userNotInCommunity(userId));
                return;
            }

            let imageFile: string | null = null;
            if (request.file) {
                const file = request.file;
                imageFile = await this.imageManager.upload(file.buffer, userId, file.originalname);
            }
            const newPost: NewPost = { ...post, userId: user.id, imageFile, moodValue, communityIds: postCommunityIds };
            await this.postDal.createPost(newPost);
            response.status(200).json({});
        } catch (error) {
            this.logger.error(`Error submitting post in communities ${post.communityIds}`, { error });
            next(new ServerException(`Error submitting post in communities ${post.communityIds}`));
        }
    };

    getUserPosts = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {
        const params: UserIdParam = request.params as UserIdParam;
        const userId = params.userId;
        const queries = request.query;
        const offset = parseNumberOrDefault(queries.offset, 0);
        let limit = parseNumberOrDefault(queries.limit, this.maxPostsPerFetch);
        // Don't exceed max posts per fetch
        limit = Math.min(limit, this.maxPostsPerFetch);
        try {
            const posts = await this.postDal.getUserPosts(userId, limit, offset);
            response.status(200).json(posts);
        } catch (error) {
            this.logger.error(`Error fetching posts for userId ${userId}`, { error });
            next(new ServerException(`Error fetching posts for userId ${userId}`));
        }
    };

    getCommunityPosts = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        // todo: eliminate the need for typecasting
        const params: CommunityId = request.params as CommunityId;
        const queries = request.query;
        const offset = parseNumberOrDefault(queries.offset, 0);
        let limit = parseNumberOrDefault(queries.limit, this.maxPostsPerFetch);
        // Don't exceed max posts per fetch
        limit = Math.min(limit, this.maxPostsPerFetch);
        const userId = user.id;
        const communityId = params.communityId;
        try {
            const posts = await this.postDal.getCommunityPosts(userId, communityId, limit, offset);
            response.status(200).json(posts);
        } catch (error) {
            this.logger.error(`Error fetching posts for communityId ${communityId} and ${userId}`, { error });
            next(new ServerException(`Error fetching posts for communityId ${communityId} and ${userId}`));
        }
    };

    getPostImage = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const params: PostId = request.params as PostId;

        try {
            // todo: urgent -- only return image if  the community is public, or if private the accessing user is a member
            const post = await this.postDal.getCommunityPostById(user.id, params.postId);
            if (!post.imageFile) {
                next(new NotFoundException(`Post id ${params.postId} has no image`));
                return;
            }
            return await this.imageManager.download(user.id, post.imageFile, response);
        } catch (error) {
            this.logger.error(`Error loading image for postId ${params.postId} and requesting user ${user.id}`, { error });
            next(new ServerException(`Error loading image for postId ${params.postId} and requesting user ${user.id}`));
        }
    };

    likePost = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const user = request.user;
        const { like, postId, communityId } = request.body as LikePostDTO;
        try {
            if (like) {
                await this.postDal.likePost(postId, communityId, user.id);
            } else {
                await this.postDal.unlikePost(postId, communityId, user.id);
            }
            const post = await this.postDal.getCommunityPostById(user.id, postId);
            response.status(200).json(post);
        } catch (error) {
            this.logger.error(`Error liking postId ${postId} for userId: ${user.id}, like:${like}}`, { error });
            next(new ServerException(`Error liking post ${postId}`));
        }
    };
}
