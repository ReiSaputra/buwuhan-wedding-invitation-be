import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { UploadFolder, UploadImageRes } from "./upload.types";

export class UploadService {
  static async uploadImage(file: Express.Multer.File, folder: UploadFolder, baseUrl: string): Promise<UploadImageRes> {
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype === "image/png" ? ".png" : file.mimetype === "image/webp" ? ".webp" : ".jpg");
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const targetPath = path.join(uploadDir, uniqueName);

    await fs.promises.writeFile(targetPath, file.buffer);

    const rootUrl = process.env.APP_URL?.replace(/\/$/, "") || baseUrl.replace(/\/$/, "");
    const publicUrl = `${rootUrl}/uploads/${folder}/${uniqueName}`;

    return {
      message: "Gambar berhasil diunggah",
      status: 201,
      data: {
        url: publicUrl,
      },
    };
  }
}
