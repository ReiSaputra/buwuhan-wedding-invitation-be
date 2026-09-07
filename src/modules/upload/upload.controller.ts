import type { NextFunction, Request, Response } from "express";
import { UploadService } from "./upload.service";
import type { UploadFolder, UploadImageRes } from "./upload.types";

export class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folder: UploadFolder = (req.body?.folder as UploadFolder) || "images";
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const response: UploadImageRes = await UploadService.uploadImage(req.file!, folder, baseUrl);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
