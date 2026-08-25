import { Router } from "express";

import { authRouter } from "../../modules/auth/auth.routes";

const v1Router = Router();

v1Router.use("/api/v1", authRouter);

export { v1Router };
