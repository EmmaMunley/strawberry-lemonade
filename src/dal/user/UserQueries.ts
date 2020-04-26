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
    private usernameExistsQuery: string;
    private createUserQuery: string;
    private getUserByIdQuery: string;
    private getUserByUsernameQuery: string;
    private verifyUserQuery: string;

    constructor(config: AppConfiguration) {
        super(config, "user");
        this.getUserDetailsQuery = this.loadSQLFile("GetUserDetails");
        this.updateUserPasswordQuery = this.loadSQLFile("UpdatePassword");
        this.updateUserImageQuery = this.loadSQLFile("UpdateImage");
        this.getUserIdQuery = this.loadSQLFile("GetUserId");
        this.usernameExistsQuery = this.loadSQLFile("UsernameExists");
        this.createUserQuery = this.loadSQLFile("CreateUser");
        this.getUserByIdQuery = this.loadSQLFile("GetUserById");
        this.getUserByUsernameQuery = this.loadSQLFile("GetUserByUsername");
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

    public getUserId(username: string): Query {
        return { query: this.getUserIdQuery, values: [username] };
    }

    public usernameExists(username: string): Query {
        return { query: this.usernameExistsQuery, values: [username] };
    }

    public createUser(username: string, password: string, phoneNumber: string, verificationToken: string): Query {
        return { query: this.createUserQuery, values: [username, password, phoneNumber, verificationToken] };
    }

    public getUserById(userId: string): Query {
        return { query: this.getUserByIdQuery, values: [userId] };
    }

    public getUserByUsername(username: string): Query {
        return { query: this.getUserByUsernameQuery, values: [username] };
    }

    public verifyUser(userId: string): Query {
        return { query: this.verifyUserQuery, values: [userId] };
    }
}
