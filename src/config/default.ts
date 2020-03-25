import { ConfigurationData } from "./Configuration";

const config: ConfigurationData = {
    log: {
        level: "debug",
    },
    // Name of the application
    application: {
        name: "typescript-backend-template",
        rootDir: "src",
    },
    auth: {
        saltRounds: 10,
        // Matches string starting with a character, followed by alphanumerics, with total length between 2 and 20 inclusive
        usernameRegex: /^(?=.{2,20}$)([a-zA-Z]+[a-zA-Z0-9]*$)/i,
        /* Matches string with at least one lower and uppercase character, one special character, and one number
                 with total length between 7 and 20 inclusive */
        passwordRegex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,30}$/i,
        smsAttributes: {
            DefaultSMSType: "Transactional",
            DefaultSenderID: "PinTalk",
            MonthlySpendLimit: "5", // in USD
        },
    },
    postgres: {
        tableNames: {
            usersTable: "users",
        },
        pool: {
            database: "bliss-registry",
            user: "postgres",
            password: "password",
            host: "localhost",
            port: 5432,
            max: 128, // set pool max size to 20
            min: 16, // set min pool size to 4
            idleTimeoutMillis: 5000, // close idle clients after 1 second
            connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
        },
    },
    aws: {
        region: "us-east-1",
        s3: {
            url: "http://localhost:4572",
            bucket: "bliss-registry",
        },
    },
    verification: {
        tokenLength: 6,
    },
    jwt: {
        // expire in 5 years
        expirationSeconds: 60 * 60 * 24 * 365 * 5,
        secret: "mush-head",
    },
    port: process.env.PORT || 4040,
};

export default config;
