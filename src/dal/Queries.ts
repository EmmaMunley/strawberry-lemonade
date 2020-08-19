import fs from "fs";
import { LoggerFactory } from "../logger/LoggerFactory";
import { unmanaged, injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { join } from "path";
import { Logger } from "winston";

@injectable()
export abstract class Queries {
    protected logger: Logger;
    private sqlPath: string;

    constructor(config: AppConfiguration) {
        const { sqlDir } = config.get().application;
        this.logger = LoggerFactory.getLogger(module);
        this.sqlPath = join(config.getSrcPath(), sqlDir);
    }

    protected _loadSQLFile(queryDir: string, file: string): string {
        try {
            const path = join(this.sqlPath, queryDir, `${file}.sql`);
            const data = fs.readFileSync(path);
            return data.toString("utf8");
        } catch (error) {
            this.logger.error(`Error reading SQL file ${file}`, { error });
            throw error;
        }
    }

    minutes(quantity: number): string {
        return `${quantity} MINUTES`;
    }
}

@injectable()
export class CategorizedQueries extends Queries {
    private queryDir: string;

    // To explain why we need the unmanaged annotation, this is a base class and https://github.com/inversify/InversifyJS/issues/522
    constructor(config: AppConfiguration, @unmanaged() queryDir: string) {
        super(config);
        this.queryDir = queryDir;
    }

    loadSQLFile(file: string): string {
        return this._loadSQLFile(this.queryDir, file);
    }

    protected getValueString(numCols: number, numRows: number): string {
        const values = [];
        for (let i = 0; i < numRows; i++) {
            // Single row
            const rowVals = [];
            for (let j = 0; j < numCols; j++) {
                rowVals.push(`$${i * numCols + j + 1}`);
            }
            // Example row: ($1, $2, $3, $4)
            const row = `(${rowVals.join(", ")})`;
            values.push(row);
        }
        return values.join(", ");
    }
}
