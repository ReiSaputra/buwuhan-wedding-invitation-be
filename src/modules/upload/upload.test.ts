import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { app } from "../../app";

describe("Upload Module (POST /v1/api/uploads/images)", () => {
  const secret = process.env.JWT_SECRET || "test-secret";
  process.env.JWT_SECRET = secret;

  const validToken = jwt.sign({ id: "user-test-123", role: "USER", planTier: "FREE" }, secret, { expiresIn: "1h" });

  const testUploadDir = path.join(process.cwd(), "uploads");

  afterAll(async () => {
    // Bersihkan file testing di folder uploads jika ada
    try {
      if (fs.existsSync(testUploadDir)) {
        fs.rmSync(testUploadDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  });

  it("should return 401 when Authorization header is missing", async () => {
    const res = await request(app).post("/v1/api/uploads/images").attach("file", Buffer.from("fake image"), "test.png");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 422 when no file is uploaded", async () => {
    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).field("folder", "images");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Berkas gambar wajib diunggah");
  });

  it("should return 422 when uploaded file is not an allowed image format", async () => {
    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).attach("file", Buffer.from("plain text content"), {
      filename: "document.txt",
      contentType: "text/plain",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Format berkas tidak didukung");
  });

  it("should return 422 when file size exceeds 5 MB limit", async () => {
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5 MB + 1 KB

    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).attach("file", largeBuffer, {
      filename: "large.jpg",
      contentType: "image/jpeg",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Ukuran berkas melebihi batas maksimum 5 MB");
  });

  it("should return 422 when folder is invalid", async () => {
    // 1x1 PNG dummy buffer
    const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).field("folder", "invalid_folder").attach("file", pngBuffer, {
      filename: "sample.png",
      contentType: "image/png",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Folder tidak valid");
  });

  it("should successfully upload image and return 201 with public URL (default images folder)", async () => {
    const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).attach("file", pngBuffer, {
      filename: "sample.png",
      contentType: "image/png",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Gambar berhasil diunggah");
    expect(res.body.data).toBeDefined();
    expect(res.body.data.url).toMatch(/\/uploads\/images\/.*\.png$/);

    // Verifikasi berkas statis dapat diakses kembali lewat express.static
    const url = new URL(res.body.data.url);
    const staticRes = await request(app).get(url.pathname);
    expect(staticRes.status).toBe(200);
    expect(staticRes.header["content-type"]).toContain("image/png");
  });

  it("should successfully upload image to qris folder", async () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

    const res = await request(app).post("/v1/api/uploads/images").set("Authorization", `Bearer ${validToken}`).field("folder", "qris").attach("file", jpegBuffer, {
      filename: "qris.jpg",
      contentType: "image/jpeg",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/\/uploads\/qris\/.*\.jpg$/);
  });
});
