import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";

@injectable()
export class VerificationTokenFactory {
    private tokenLength: number;

    constructor(config: AppConfiguration) {
        this.tokenLength = config.get().verification.tokenLength;
    }

    private generateRandomDigit(): number {
        return Math.floor(Math.random() * 10);
    }

    // A verification token  is defined as a`tokenLength` long string
    // comprised entirely of random decimal numbers
    public getVerificationToken(): string {
        let token = "";
        for (let i = 0; i < this.tokenLength; i++) {
            token += this.generateRandomDigit();
        }
        return token;
    }
}
