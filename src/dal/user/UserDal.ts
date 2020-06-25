import { CreateUserDTO } from "../../dto/user/CreateUserDto";
import { User, UserId, UserDetails } from "../../types/user/User";
import {
    ErrorResponse,
    emailTaken,
    alreadyVerified,
    incorrectVerificationToken,
    incorrectPassword,
} from "../../error/errorResponses";
import { Pool } from "../../database/pool/Pool";
import { AppConfiguration } from "../../config/Configuration";
import { injectable } from "inversify";
import { UserQueries } from "./UserQueries";
import { Queriable } from "../../database/pool/QueryClient";
import { Either, left, right } from "fp-ts/lib/Either";
import { LoggerFactory } from "../../logger/LoggerFactory";
import bcrypt from "bcryptjs";
import { VerifyUserDTO } from "../../dto/user/VerifyUserDto";
import { Exists } from "../../types/StandardTypes";
import { Logger } from "winston";

@injectable()
export default class UserDal {
    private pool: Pool;
    private saltRounds: number;
    private queries: UserQueries;
    private logger: Logger;

    constructor(queries: UserQueries, pool: Pool, config: AppConfiguration) {
        this.queries = queries;
        this.pool = pool;
        this.saltRounds = config.get().auth.saltRounds;
        this.logger = LoggerFactory.getLogger(module);
    }

    public async updateUserImage(userId: string, imageFile: string): Promise<void> {
        const query = this.queries.updateUserImage(userId, imageFile);
        await this.pool.returningNone(query);
    }

    public async updateUserPassword(userId: string, password: string): Promise<void> {
        const hashed = await this.hashPassword(password);
        const query = this.queries.updateUserPassword(userId, hashed);
        await this.pool.returningNone(query);
    }

    public async getUserDetails(userId: string): Promise<UserDetails> {
        const query = this.queries.getUserDetails(userId);
        return await this.pool.returningOne(query, UserDetails);
    }

    public async getUserId(email: string): Promise<string> {
        const query = this.queries.getUserId(email);
        const result = await this.pool.returningOne(query, UserId);
        return result.id;
    }

    public async emailExists(email: string, connection?: Queriable): Promise<boolean> {
        const query = this.queries.emailExists(email);
        const client = connection ? connection : this.pool;
        const result = await client.returningOne(query, Exists);
        return result.exists;
    }

    private async hashPassword(password: string): Promise<string> {
        const hashed = await bcrypt.hash(password, this.saltRounds);
        return hashed;
    }

    public async createUser(
        user: CreateUserDTO,
        verificationToken: string,
    ): Promise<Either<ErrorResponse, UserDetails>> {
        const transaction = await this.pool.transaction();
        await transaction.begin();
        try {
            const exists = await this.emailExists(user.email, transaction);
            if (exists) {
                return left(emailTaken(user.email));
            }
            const password = await this.hashPassword(user.password);
            const query = this.queries.createUser(user.email, password, user.phoneNumber, verificationToken);
            const createUser = await transaction.returningOne(query, UserDetails);
            await transaction.commit();
            return right(createUser);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async verifyUser(verification: VerifyUserDTO): Promise<Either<ErrorResponse, UserDetails>> {
        const query = this.queries.getUserById(verification.userId);
        const user = await this.pool.returningOne(query, User);
        if (user.isVerified) {
            return left(alreadyVerified());
        } else if (verification.verificationToken !== user.verificationToken) {
            return left(incorrectVerificationToken());
        }
        const verifyUserQuery = this.queries.verifyUser(verification.userId);
        const updated = await this.pool.returningOne(verifyUserQuery, UserDetails);

        return right(updated);
    }

    public async checkPassword(email: string, password: string): Promise<Either<ErrorResponse, UserDetails>> {
        const query = this.queries.getUserByEmail(email);
        const user = await this.pool.returningOne(query, User);
        const isPasswordMatching = await bcrypt.compare(password, user.password);
        const userDetails = this.userToUserDetails(user);
        if (isPasswordMatching) {
            return right(userDetails);
        } else {
            return left(incorrectPassword());
        }
    }

    // todo: investigate a generic transformation
    private userToUserDetails(user: User): UserDetails {
        return {
            id: user.id,
            email: user.email,
            imageExists: user.imageExists,
            imageFile: user.imageFile,
            createdAt: user.createdAt,
        };
    }
}
