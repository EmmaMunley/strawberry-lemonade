import { v4 as uuid } from "uuid";
import { ConfigurationData, AppConfiguration } from "../../src/config/Configuration";

class MockAppConfiguration extends AppConfiguration {
    private db: string;
    // Port 0 prompts the OS to allocate an unallocated random port for the process
    private static PORT = 0;

    constructor() {
        super();
        this.db = `test_${this.config.application.name}_${uuid()}`;
    }

    getDbName(): string {
        return this.db;
    }

    getDbConfig(): { user: string; password: string; port: number; host: string } {
        return {
            user: this.config.postgres.pool.user,
            password: this.config.postgres.pool.password,
            port: this.getPort(),
            host: "localhost",
        };
    }

    getPort(): number {
        return MockAppConfiguration.PORT;
    }

    public get(): ConfigurationData {
        const config = { ...this.config };
        config.port = this.getPort();
        config.postgres.pool.database = this.getDbName();
        return config;
    }
}

export default new MockAppConfiguration();
