import "reflect-metadata";
import { Container } from "inversify";

const dependencies = new Container({ autoBindInjectable: true });

export { dependencies };
