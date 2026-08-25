import { Router } from "express";

import { AuthController } from "./auth.controller";
import { signInSchema, signUpSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate.middleware";
import { loginRateLimiter, refreshTokenRateLimiter, registerRateLimiter } from "../../middlewares/rate-limit.middleware";

export const authRouter = Router();

authRouter.post("/auth/register", registerRateLimiter, validate(signUpSchema), AuthController.signUp);
authRouter.post("/auth/login", loginRateLimiter, validate(signInSchema), AuthController.signIn);
authRouter.post("/auth/refresh-token", refreshTokenRateLimiter, AuthController.refreshToken);
authRouter.post("/auth/logout", AuthController.logout);
