import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ValidationError } from "../../errors/app.error";
import { uploadImageSchema } from "./upload.schema";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new ValidationError("Format berkas tidak didukung. Hanya JPEG, PNG, dan WebP yang diperbolehkan"));
    }
    cb(null, true);
  },
}).single("file");

export const handleImageUpload = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ValidationError("Ukuran berkas melebihi batas maksimum 5 MB"));
        }
        return next(new ValidationError(`Kesalahan unggah berkas: ${err.message}`));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new ValidationError("Berkas gambar wajib diunggah"));
    }

    const parseResult = uploadImageSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new ValidationError(`Folder tidak valid: ${issue.message}`));
    }

    req.body = parseResult.data;
    next();
  });
};
