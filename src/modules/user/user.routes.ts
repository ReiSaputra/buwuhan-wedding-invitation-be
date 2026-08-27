import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const userRouter = Router();

// Protected -- Profile info pengguna login
userRouter.get("/users/me", requireAuth, UserController.getProfile);
