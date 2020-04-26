import "reflect-metadata";
import { config } from "./default";
import prodConfig from "./production";
import { injectable } from "inversify";
import { trimPath } from "../utils/files";

export type ConfigurationData = typeof config;

@injectable()
export class AppConfiguration {
    private config: ConfigurationData;

    constructor() {
        let _config: ConfigurationData = config;
        if (process.env.NODE_ENV === "prod") {
            _config = { ...config, ...prodConfig };
        }
        this.config = _config;
    }

    public getSrcPath(): string {
        return trimPath(__dirname, this.config.application.rootDir);
    }
    // todo: refactor this to more granular data
    public get(): ConfigurationData {
        // only a shallow copy -- copying approach sucks
        return { ...this.config };
    }
}
