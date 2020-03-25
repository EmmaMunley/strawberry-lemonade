import { User, UserDetails } from "../types/user/User";
import jwt from "jsonwebtoken";
import express from "express";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";

export interface TokenData {
    token: string;
    expiresIn: number;
}

export interface DataStoredInToken extends UserDetails {
    // Issued at
    iat: number;
    // Expiration time
    exp: number;
}

@injectable()
export class JWTManager {
    private secret: string;
    private expiresIn: number;

    constructor(config: AppConfiguration) {
        const configData = config.get();
        this.secret = configData.jwt.secret;
        this.expiresIn = configData.jwt.expirationSeconds;
    }

    private createToken(user: UserDetails): TokenData {
        return {
            token: jwt.sign(user, this.secret, { expiresIn: this.expiresIn }),
            expiresIn: this.expiresIn,
        };
    }

    private createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token};path=/; HttpOnly;Max-Age=${tokenData.expiresIn};`;
    }

    public verifyToken(cookies?: Record<string, any>): DataStoredInToken | undefined {
        if (cookies && cookies.Authorization) {
            return jwt.verify(cookies.Authorization, this.secret) as DataStoredInToken;
        } else {
            return undefined;
        }
    }

    public setJWTHeader(user: UserDetails, res: express.Response): void {
        const token = this.createToken(user);
        const cookie = this.createCookie(token);
        res.setHeader("Set-Cookie", [cookie]);
    }

    public removeJWTHeader(res: express.Response): void {
        res.setHeader("Set-Cookie", ["Authorization=;path=/; HttpOnly;Max-age=0"]);
    }
}
