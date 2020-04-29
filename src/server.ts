import App from "./App";
import { dependencies } from "./dependencies/inversify.config";

const app: App = dependencies.get(App);
app.startServer();
