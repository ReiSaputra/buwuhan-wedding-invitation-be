export type UploadFolder = "images" | "qris";

export interface UploadImageRes {
  message: string;
  status: number;
  data: {
    url: string;
  };
}
