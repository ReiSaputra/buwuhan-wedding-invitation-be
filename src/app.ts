import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

import { v1Router } from "./routes/v1/index";

import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/v1", v1Router);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use(errorHandler);

export { app };
