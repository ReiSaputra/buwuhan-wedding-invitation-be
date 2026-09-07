import { z } from "zod";

export const uploadImageSchema = z.object({
  folder: z.enum(["images", "qris"]).default("images"),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
