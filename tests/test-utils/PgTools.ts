import { Client } from "pg";

type PgToolsConfig = {
    user: string;
    password: string;
    port: number;
};

// Hard-coded localhost to ensure this never mistakenly runs on production code
const LOCAL_HOST = "localhost";
// Hard-coded admin db used to create other test dbs
const ADMIN_DB = "postgres";

function createOrDropDatabase(action: "CREATE" | "DROP") {
    return async function(_config: PgToolsConfig, dbName: string): Promise<void> {
        const config = { ..._config, host: LOCAL_HOST, database: ADMIN_DB };
        const client = new Client(config);
        return new Promise(async (resolve, reject) => {
            client.on("drain", client.end.bind(client));
            client.connect();
            const sql = `${action} DATABASE "${dbName}";`;
            try {
                await client.query(sql);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };
}

export default {
    createdb: createOrDropDatabase("CREATE"),
    dropdb: createOrDropDatabase("DROP"),
};
