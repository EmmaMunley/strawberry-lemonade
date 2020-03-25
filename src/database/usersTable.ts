import Knex from "knex";
import { ConfigurationData } from "../config/Configuration";
import { LoggerFactory } from "../logger/LoggerFactory";

export async function initializeUsersTable(connection: Knex, config: ConfigurationData): Promise<void> {
    const logger = LoggerFactory.getLogger(module);
    const usersTable: string = config.postgres.tableNames.usersTable;
    const tableExists = await connection.schema.hasTable(usersTable);
    if (!tableExists) {
        logger.info(`Creating table '${usersTable}'...`);
        await connection.schema.createTable(usersTable, table => {
            table
                .uuid("id")
                .primary()
                .defaultTo(connection.raw("uuid_generate_v4()"))
                .notNullable();
            table
                .string("username")
                .unique()
                .notNullable();
            table.string("password").notNullable();
            table.string("phone_number").notNullable();
            table
                .boolean("is_verified")
                .notNullable()
                .defaultTo(false);
            table.string("verification_token");
            table.string("image_file");
            table.timestamps(true, true);
        });
        logger.info(`Finished creating table '${usersTable}'`);
    }
}
