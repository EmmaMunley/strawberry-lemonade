import { createLogger, format, transports, Logger } from "winston";
import { Format, Colorizer, TransformableInfo } from "logform";
import { shrinkPath, removeExtension } from "../utils/files";
import { AppConfiguration } from "../config/Configuration";
import { injectable } from "inversify";

const { combine, timestamp, printf, colorize } = format;

// Visible for testing
@injectable()
export class LoggerFactory {
    private seed: Logger;
    // Write all logs logLevel and below (error is 0, debug is 5)
    // https://github.com/winstonjs/winston#logging
    private logLevel: string;
    // Name of the application
    private appName: string;
    // Root directory of the source code
    private rootDir: string;

    constructor(config: AppConfiguration) {
        const configData = config.get();
        this.logLevel = configData.log.level;
        this.appName = configData.application.name;
        this.rootDir = configData.application.rootDir;
        this.seed = this.buildLogger();
        this.getLoggerForModule = this.getLoggerForModule.bind(this);
        this.getLoggerWithContext = this.getLoggerWithContext.bind(this);
    }

    private buildLogger(): Logger {
        // Non-colorized log format to print logs into log files
        const simpleLogFormat = this.buildLogFormat(false);
        // Colorized format to print logs into stdout
        const colorizedLogFormat = this.buildLogFormat(true);
        return createLogger({
            format: combine(timestamp(), simpleLogFormat),
            transports: [
                new transports.Console({ level: this.logLevel, format: colorizedLogFormat }),
                new transports.File({ filename: `/tmp/${this.appName}-error.log`, level: "error" }),
                new transports.File({ filename: `/tmp/${this.appName}.log`, level: this.logLevel }),
            ],
            exitOnError: false,
        });
    }

    private buildLogFormat(withColorizedLogs = false): Format {
        const colorizer: Colorizer = colorize();
        return printf(({ level, message, timestamp, context, error }: TransformableInfo) => {
            let prefix = `[${timestamp} ${level.toUpperCase()} ${context}]`;
            if (withColorizedLogs) {
                prefix = colorizer.colorize(level, prefix);
            }
            if (error instanceof Error) {
                message += ` --- ${error.stack}`;
            }
            // Example log: [2019-10-10T05:12:00:00Z INFO] user-router-logger: Message goes here!
            return `${prefix}: ${message}`;
        });
    }

    private getLoggerForModule(module: NodeModule): Logger {
        const filePath = removeExtension(shrinkPath(this.rootDir, module.filename));
        const context = filePath.replace("/", ".");
        return this.getLoggerWithContext(context);
    }

    private getLoggerWithContext(context: string): Logger {
        const loggerOptions = context ? { context } : {};
        return this.seed.child(loggerOptions);
    }

    public getLogger(context: string | NodeModule): Logger {
        return typeof context === "string" ? this.getLoggerWithContext(context) : this.getLoggerForModule(context);
    }
}
