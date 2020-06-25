import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";
import { CategorizedQueries } from "../Queries";
import { AppConfiguration } from "../../config/Configuration";

@injectable()
export class UserQueries extends CategorizedQueries {
    private getUserDetailsQuery: string;
    private updateUserPasswordQuery: string;
    private updateUserImageQuery: string;
    private getUserIdQuery: string;
    private emailExistsQuery: string;
    private createUserQuery: string;
    private getUserByIdQuery: string;
    private getUserByEmailQuery: string;
    private verifyUserQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "user");
        this.getUserDetailsQuery = this.loadSQLFile("GetUserDetails");
        this.updateUserPasswordQuery = this.loadSQLFile("UpdatePassword");
        this.updateUserImageQuery = this.loadSQLFile("UpdateImage");
        this.getUserIdQuery = this.loadSQLFile("GetUserId");
        this.emailExistsQuery = this.loadSQLFile("EmailExists");
        this.createUserQuery = this.loadSQLFile("CreateUser");
        this.getUserByIdQuery = this.loadSQLFile("GetUserById");
        this.getUserByEmailQuery = this.loadSQLFile("GetUserByEmail");
        this.verifyUserQuery = this.loadSQLFile("VerifyUser");
    }

    public getUserDetails(userId: string): Query {
        return { query: this.getUserDetailsQuery, values: [userId] };
    }

    public updateUserPassword(userId: string, password: string): Query {
        return { query: this.updateUserPasswordQuery, values: [userId, password] };
    }

    public updateUserImage(userId: string, imageFile: string): Query {
        return { query: this.updateUserImageQuery, values: [userId, imageFile] };
    }

    public getUserId(email: string): Query {
        return { query: this.getUserIdQuery, values: [email] };
    }

    public emailExists(email: string): Query {
        return { query: this.emailExistsQuery, values: [email] };
    }

    public createUser(email: string, password: string, phoneNumber: string, verificationToken: string): Query {
        return { query: this.createUserQuery, values: [email, password, phoneNumber, verificationToken] };
    }

    public getUserById(userId: string): Query {
        return { query: this.getUserByIdQuery, values: [userId] };
    }

    public getUserByEmail(email: string): Query {
        return { query: this.getUserByEmailQuery, values: [email] };
    }

    public verifyUser(userId: string): Query {
        return { query: this.verifyUserQuery, values: [userId] };
    }
}
