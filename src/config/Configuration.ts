import "reflect-metadata";
import defaultConfig from "./default";
import prodConfig from "./production";
import { injectable } from "inversify";

@injectable()
export class AppConfiguration {
    private config: ConfigurationData;

    constructor() {
        let _config: ConfigurationData = defaultConfig;
        if (process.env.NODE_ENV === "prod") {
            _config = { ...defaultConfig, ...prodConfig };
        }
        this.config = _config;
    }

    // todo: refactor this to more granular data
    public get(): ConfigurationData {
        // only a shallow copy -- copying approach sucks
        return { ...this.config };
    }
}

export interface ConfigurationData {
    log: {
        level: string;
    };
    application: {
        name: string;
        rootDir: string;
    };
    auth: {
        saltRounds: number;
        usernameRegex: RegExp;
        passwordRegex: RegExp;
        smsAttributes: {
            DefaultSMSType: string;
            DefaultSenderID: string;
            MonthlySpendLimit: string;
        };
    };
    aws: {
        region: string;
        s3: {
            url: string;
            bucket: string;
        };
    };
    postgres: {
        tableNames: {
            usersTable: string;
        };
        pool: {
            database: string;
            user: string;
            password: string;
            port: number;
            max: number;
            min: number;
            host: string;
            idleTimeoutMillis: number;
            connectionTimeoutMillis: number;
        };
    };
    verification: {
        tokenLength: number;
    };
    jwt: {
        expirationSeconds: number;
        secret: string;
    };
    port: string | number;
}
