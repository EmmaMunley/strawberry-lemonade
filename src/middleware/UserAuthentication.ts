import express from "express";
import { DataStoredInToken, JWTManager } from "../jwt/JWTManager";
import { RequestWithUser } from "../types/request/RequestWithUser";
import { ErrorResponse, isErrorResponse } from "../error/errorResponses";
import { UserDetails } from "../types/user/User";
import BadAuthenticationTokenException from "../exceptions/BadAuthenticationTokenException";
import MissingAuthenticationTokenException from "../exceptions/MissingAuthenticationTokenException";
import { LoggerFactory } from "../logger/LoggerFactory";
import { injectable } from "inversify";

interface RequestWithUserHandler {
    (request: RequestWithUser, response: express.Response, next: express.NextFunction): void;
}

@injectable()
export class UserAuthentication {
    private jwtManager: JWTManager;
    private logger = LoggerFactory.getLogger(module);
    readonly BAD_AUTH = "JWT authentication token is invalid";
    readonly MISSING_AUTH = "JWT authentication token is missing";

    constructor(jwtManager: JWTManager) {
        this.jwtManager = jwtManager;

        this.withUser = this.withUser.bind(this);
        this.authenticate = this.authenticate.bind(this);
    }

    withUser(route: RequestWithUserHandler): express.RequestHandler {
        return (request: express.Request, response: express.Response, next: express.NextFunction): void => {
            const reqWithUser = request as RequestWithUser;
            route(reqWithUser, response, next);
        };
    }

    async authenticate(request: express.Request, _: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const verificationResponse: DataStoredInToken | undefined = this.jwtManager.verifyToken(request.cookies);
            if (verificationResponse !== undefined) {
                // todo: fetch from database if issued at exceeds a certain threshold
                const data: UserDetails | ErrorResponse = await (async (): Promise<UserDetails> => ({
                    ...verificationResponse,
                }))();
                if (isErrorResponse(data)) {
                    this.logger.debug(this.BAD_AUTH);
                    next(new BadAuthenticationTokenException());
                } else {
                    (request as RequestWithUser).user = data;
                    next();
                }
            } else {
                this.logger.debug(this.MISSING_AUTH);
                next(new MissingAuthenticationTokenException());
            }
        } catch {
            this.logger.debug(this.BAD_AUTH);
            next(new BadAuthenticationTokenException());
        }
    }
}
