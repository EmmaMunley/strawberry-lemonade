import express from "express";
import Controller from "./Controller";
import { validateBody, validateParams } from "../middleware/validation";
import UserDal from "../dal/UserDal";
import { NextFunction } from "connect";
import ServerException from "../exceptions/ServerException";
import ClientException from "../exceptions/ClientException";
import { LoggerFactory } from "../logger/loggerFactory";
import { CreateUserDTO } from "../dto/user/CreateUserDto";
import { UserIdParam, UserDetails } from "../types/user/User";
import { UserExistsDTO } from "../dto/user/UserExistsDto";
import { ErrorResponse } from "../error/errorResponses";
import { VerifyUserDTO } from "../dto/user/VerifyUserDto";
import { JWTManager } from "../jwt/JWTManager";
import { LoginUserDTO } from "../dto/user/LoginUserDto";
import { injectable } from "inversify";
import { VerificationManager } from "../verification/VerificationManager";
import { Either, isRight, isLeft } from "fp-ts/lib/Either";
import { UserAuthentication } from "../middleware/UserAuthentication";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { requiredFile } from "../middleware/ImageUpload";
import { ImageManager } from "../images/ImageManager";
import NotFoundException from "../exceptions/NotFoundException";
import { ChangePasswordDTO } from "../dto/user/ChangePasswordDto";

@injectable()
export default class UserController implements Controller {
    public path = "/user";
    public router = express.Router();
    private USER_IMAGE_FILE = "image";
    private logger = LoggerFactory.getLogger(module);

    private userDal: UserDal;
    private verificationManager: VerificationManager;
    private jwtManager: JWTManager;
    private auth: UserAuthentication;
    private imageManager: ImageManager;

    constructor(
        userDal: UserDal,
        verificationManager: VerificationManager,
        jwtManager: JWTManager,
        auth: UserAuthentication,
        imageManager: ImageManager,
    ) {
        this.userDal = userDal;
        this.verificationManager = verificationManager;
        this.jwtManager = jwtManager;
        this.auth = auth;
        this.imageManager = imageManager;
        this.intializeRoutes();
    }

    public intializeRoutes(): void {
        this.router.get("/:userId", this.auth.authenticate, validateParams(UserIdParam), this.getUser);
        this.router.get("/:userId/image", this.auth.authenticate, validateParams(UserIdParam), this.auth.withUser(this.getUserImage));
        this.router.get("/logout", this.logoutUser);
        this.router.post("/", validateBody(CreateUserDTO), this.createUser);
        this.router.post("/image", this.auth.authenticate, requiredFile(this.USER_IMAGE_FILE), this.auth.withUser(this.submitUserImage));
        this.router.post("/login", validateBody(LoginUserDTO), this.loginUser);
        this.router.post("/verify", validateBody(VerifyUserDTO), this.verifyUser);
        this.router.post("/exists", validateBody(UserExistsDTO), this.checkUserExists);
        this.router.post("/password", this.auth.authenticate, validateBody(ChangePasswordDTO), this.auth.withUser(this.changePassword));
    }

    changePassword = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const changePasswordDto: ChangePasswordDTO = request.body;
        const user = request.user;
        const password = changePasswordDto.password;
        const newPassword = changePasswordDto.newPassword;
        try {
            const data = await this.userDal.checkPassword(user.username, password);
            if (isLeft(data)) {
                const error = data.left;
                return next(new ClientException(error.message, error.errorCodes));
            }
            await this.userDal.updateUserPassword(user.id, newPassword);
            response.status(200).json({});
        } catch (error) {
            this.logger.error(`Error changing password for userId ${user.id}`, { error });
            next(new ServerException(`Error changing password for userId ${user.id}`));
        }
    };

    getUser = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {
        const params = request.params as UserIdParam;
        try {
            const userDetails = await this.userDal.getUserDetails(params.userId);
            response.status(200).json(userDetails);
        } catch (error) {
            this.logger.error(`Error fetching user details for userId ${params.userId}`, { error });
            next(new ServerException(`Error fetching user details for userId ${params.userId}`));
        }
    };

    getUserImage = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const params = request.params as UserIdParam;
        try {
            const userDetails = await this.userDal.getUserDetails(params.userId);
            if (!userDetails.imageFile) {
                next(new NotFoundException(`User with id ${userDetails.id} has no image`));
                return;
            }
            return await this.imageManager.download(userDetails.id, userDetails.imageFile, response);
        } catch (error) {
            this.logger.error(`Error loading user image for userId ${params.userId}`, { error });
            next(new ServerException(`Error loading user image for userId ${params.userId}`));
        }
    };

    submitUserImage = async (request: RequestWithUser, response: express.Response, next: express.NextFunction): Promise<void> => {
        const userId = request.user.id;
        const file = request.file;
        try {
            const imageFile = await this.imageManager.upload(file.buffer, userId, file.originalname);
            await this.userDal.updateUserImage(userId, imageFile);
            response.status(200).json({ imageFile });
        } catch (error) {
            this.logger.error(`Error uploading user image for userId ${userId}`, { error });
            next(new ServerException(`Error uploading user image for userId ${userId}`));
        }
    };

    createUser = async (request: express.Request, response: express.Response, next: NextFunction): Promise<void> => {
        const newUser: CreateUserDTO = request.body;
        try {
            const token: string = this.verificationManager.tokenFactory.getVerificationToken();
            const data: Either<ErrorResponse, UserDetails> = await this.userDal.createUser(newUser, token);
            if (isRight(data)) {
                const user = data.right;
                this.verificationManager.sendVerificationToken(newUser.phoneNumber, token);
                this.logger.info(`Created user: ${JSON.stringify(user)}`);
                response.status(201).json(user);
            } else {
                const error = data.left;
                next(new ClientException(error.message, error.errorCodes));
            }
        } catch (error) {
            this.logger.error(`Error creating user ${JSON.stringify({ username: newUser.username, phoneNumber: newUser.phoneNumber })}`, { error });
            next(new ServerException("Failed to create user"));
        }
    };

    checkUserExists = async (request: express.Request, response: express.Response, next: NextFunction): Promise<void> => {
        const user: UserExistsDTO = request.body;
        try {
            const exists = await this.userDal.usernameExists(user.username);
            this.logger.info(`Checked existence of username: ${user.username}, result: ${exists}`);
            response.status(200).json({ exists });
        } catch (error) {
            this.logger.error(`Error checking if user with username ${user.username} exists`, { error });
            next(new ServerException(`Failed checking if user exists`));
        }
    };

    verifyUser = async (request: express.Request, response: express.Response, next: NextFunction): Promise<void> => {
        const verificationRequest: VerifyUserDTO = request.body;
        try {
            const data: Either<ErrorResponse, UserDetails> = await this.userDal.verifyUser(verificationRequest);
            if (isRight(data)) {
                const user = data.right;
                this.logger.info(`Verified user: ${JSON.stringify(user)}`);
                this.jwtManager.setJWTHeader(user, response);
                response.status(200).json(user);
            } else {
                const error = data.left;
                next(new ClientException(error.message, error.errorCodes));
            }
        } catch (error) {
            this.logger.error(`Error verifying user with verification request: ${JSON.stringify(verificationRequest)}`, { error });
            next(new ServerException(`Failed checking if user exists`));
        }
    };

    loginUser = async (request: express.Request, response: express.Response, next: NextFunction): Promise<void> => {
        const user: LoginUserDTO = request.body;
        try {
            const data: Either<ErrorResponse, UserDetails> = await this.userDal.checkPassword(user.username, user.password);
            if (isRight(data)) {
                const user = data.right;
                this.logger.info(`Logged in user: ${JSON.stringify(user)}`);
                this.jwtManager.setJWTHeader(user, response);
                response.status(200).json(user);
            } else {
                const error = data.left;
                next(new ClientException(error.message, error.errorCodes));
            }
        } catch (error) {
            this.logger.error(`Error with user login for username ${user.username}`, { error });
            next(new ServerException(`Failed to login user`));
        }
    };

    logoutUser = async (_: express.Request, response: express.Response): Promise<void> => {
        this.jwtManager.removeJWTHeader(response);
        response.status(200).json({});
    };
}
