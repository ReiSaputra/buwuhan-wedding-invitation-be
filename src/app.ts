import path from "path";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

import { v1Router } from "./routes/v1/index";

import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [];

const allowedOrigins = [
  "https://www.buwuh.com",
  "https://buwuh.com",
  "http://localhost:5173",
  "http://localhost:3000",
  ...envOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} is not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/v1", v1Router);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use(errorHandler);

export { app };
