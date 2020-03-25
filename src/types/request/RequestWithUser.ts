import express from "express";
import { UserDetails } from "../user/User";

export type RequestWithUser = express.Request & { user: UserDetails };
