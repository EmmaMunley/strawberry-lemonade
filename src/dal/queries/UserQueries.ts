import { injectable } from "inversify";
import { Query } from "../../database/pool/QueryClient";

@injectable()
export class UserQueries {
    private USERNAME_EXISTS = "select exists(select true from users where username=$1);";
    private INSERT_USER =
        "insert into users (username, password, phone_number, verification_token) values ($1, $2, $3, $4) " +
        " returning *, case when image_file notnull then true else false end as image_exists;";
    private GET_USER_BY_ID = "select *, case when image_file notnull then true else false end as image_exists from users where id=$1 limit 1;";
    private GET_USER_BY_USERNAME =
        "select *, case when image_file notnull then true else false end as image_exists from users where username=$1 limit 1;";
    private VERIFY_USER =
        "update users set is_verified = true where id =$1 returning *, case when image_file notnull then true else false end as image_exists;";
    private GET_USER_ID = "select id from users where username=$1;";
    private GET_USER_DETAILS =
        "select id, username, image_file, bio, created_at, case when image_file notnull then true else false end as image_exists " +
        "from users where id=$1";
    private UPDATE_USER_IMAGE = "update users set image_file = $2 where id=$1;";
    private UPDATE_USER_BIO = "update users set bio = $2 where id=$1;";
    private UPDATE_USER_PASSWORD = "update users set password = $2 where id=$1;";

    public getUserDetails(userId: string): Query {
        return { query: this.GET_USER_DETAILS, values: [userId] };
    }

    public updateUserPassword(userId: string, password: string): Query {
        return { query: this.UPDATE_USER_PASSWORD, values: [userId, password] };
    }

    public updateUserImage(userId: string, imageFile: string): Query {
        return { query: this.UPDATE_USER_IMAGE, values: [userId, imageFile] };
    }

    public updateUserBio(userId: string, imageFile: string): Query {
        return { query: this.UPDATE_USER_BIO, values: [userId, imageFile] };
    }

    public getUserId(username: string): Query {
        return { query: this.GET_USER_ID, values: [username] };
    }

    public usernameExists(username: string): Query {
        return { query: this.USERNAME_EXISTS, values: [username] };
    }

    public insertUser(username: string, password: string, phoneNumber: string, verificationToken: string): Query {
        return { query: this.INSERT_USER, values: [username, password, phoneNumber, verificationToken] };
    }

    public getUserById(userId: string): Query {
        return { query: this.GET_USER_BY_ID, values: [userId] };
    }

    public getUserByUsername(username: string): Query {
        return { query: this.GET_USER_BY_USERNAME, values: [username] };
    }

    public verifyUser(userId: string): Query {
        return { query: this.VERIFY_USER, values: [userId] };
    }
}
