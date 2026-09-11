import { Router } from "express";

import { AuthController } from "./auth.controller";
import { signInSchema, signUpSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate.middleware";
import {
  loginRateLimiter,
  refreshTokenRateLimiter,
  registerRateLimiter,
  sessionRateLimiter,
} from "../../middlewares/rate-limit.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/auth/register", registerRateLimiter, validate(signUpSchema), AuthController.signUp);
authRouter.post("/auth/login", loginRateLimiter, validate(signInSchema), AuthController.signIn);
authRouter.post("/auth/refresh-token", refreshTokenRateLimiter, AuthController.refreshToken);
authRouter.post("/auth/logout", AuthController.logout);

// Session management
authRouter.get("/auth/sessions", requireAuth, sessionRateLimiter, AuthController.listSessions);
authRouter.post("/auth/logout-all", requireAuth, sessionRateLimiter, AuthController.logoutAll);
authRouter.delete("/auth/sessions/:id", requireAuth, sessionRateLimiter, AuthController.deleteSession);

