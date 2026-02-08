import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { getMe } from "./me.controller";

export const meRouter = Router();

meRouter.get("/me", requireAuth, getMe);
