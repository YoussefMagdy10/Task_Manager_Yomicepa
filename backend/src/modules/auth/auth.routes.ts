import { Router } from "express";
import { signup, signin, refresh, logout } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
