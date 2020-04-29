// We initilaize chaiHttp here so test files that import chai have chaiHttp methods available by default
import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

// We use pgtools to create/tear down a unique database per test file
import pgtools from "./PgTools";

/**
 * Order of imports matter for the dependency graph. AppConfiguration is a leaf node.
 * LoggerFactory has a global `dependencies.get` call with  a dependency on AppConfiguration, so we bind AppConfiguration
 *  before importing from LoggerFactory. App is the root of the dependency graph, so we resolve App only after the overriden
 * dependencies are taken care of.
 */
import { dependencies } from "../../src/dependencies/inversify.config";
import { AppConfiguration } from "../../src/config/Configuration";
import MockAppConfiguration from "../test-utils/MockAppConfiguration";
dependencies.bind(AppConfiguration).toConstantValue(MockAppConfiguration);

import { LoggerFactory } from "../../src/logger/LoggerFactory";
import { NeuteredLoggerFactory, NeuteredLoggerMiddleware } from "../test-utils/NeuteredLogger";
import * as httpLoggerMiddleware from "../../src/middleware/HttpLogger";
import sinon from "sinon";
// Comment these lines out if you want logging in your test for debugging purposes
dependencies.bind(LoggerFactory).toConstantValue(new NeuteredLoggerFactory(MockAppConfiguration));
sinon.stub(httpLoggerMiddleware, "createHttpLoggerMiddleware").returns(NeuteredLoggerMiddleware);

import App from "../../src/App";
import { Pool } from "../../src/database/pool/Pool";

// todo - speed up test builds. a big portion of the build is the TS compile time. use ts-node-dev
// or another tool to reuse/hot-reload compiles in during a `watch` test command (refer to npm run start:watch)
// investigate other slow start-up issues

// todo IMPORTANT WNS - The integration tests rely on each test being run as a separate process with mocha-parallel-tests
class TestFactory {
    private app: App;
    private pool: Pool;

    constructor() {
        this.app = dependencies.get(App);
        this.pool = dependencies.get(Pool);
    }

    async init(): Promise<void> {
        await pgtools.createdb(MockAppConfiguration.getDbConfig(), MockAppConfiguration.getDbName());
        await this.app.startServer();
    }

    async close(): Promise<void> {
        await this.app.stopServer();
        // Hack alert - sleep to prevent 'error: database "<database_name>" is being accessed by other users'
        await new Promise(resolve => setTimeout(resolve, 1000));
        await pgtools.dropdb(MockAppConfiguration.getDbConfig(), MockAppConfiguration.getDbName());
    }

    route(endpoint: string): string {
        const port = this.app.getServerPort();
        if (port == null) {
            throw new Error("Server port does not exist -- was the server started?");
        }
        return `http://localhost:${port}/${endpoint}`;
    }

    getPool(): Pool {
        return this.pool;
    }
}
export default new TestFactory();
