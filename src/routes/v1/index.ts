import { Router } from "express";

import { authRouter } from "../../modules/auth/auth.routes";
import { invitationRouter } from "../../modules/invitation/invitation.routes";
import { templateRouter } from "../../modules/template/template.routes";
import { guestRouter } from "../../modules/guest/guest.routes";
import { rsvpRouter } from "../../modules/rsvp/rsvp.routes";
import { userRouter } from "../../modules/user/user.routes";
import { dashboardRouter } from "../../modules/dashboard/dashboard.routes";

const v1Router = Router();

v1Router.use("/api", authRouter);
v1Router.use("/api", invitationRouter);
v1Router.use("/api", templateRouter);
v1Router.use("/api", guestRouter);
v1Router.use("/api", rsvpRouter);
v1Router.use("/api", userRouter);
v1Router.use("/api", dashboardRouter);

export { v1Router };
