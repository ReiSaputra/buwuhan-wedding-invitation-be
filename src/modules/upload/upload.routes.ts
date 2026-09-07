import { Router } from "express";
import { UploadController } from "./upload.controller";
import { handleImageUpload } from "./upload.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";
import { uploadRateLimiter } from "../../middlewares/rate-limit.middleware";

export const uploadRouter = Router();

uploadRouter.post("/uploads/images", requireAuth, uploadRateLimiter, handleImageUpload, UploadController.uploadImage);
