import { Router } from "express";

import { authRouter } from "../../modules/auth/auth.routes";
import { invitationRouter } from "../../modules/invitation/invitation.routes";
import { templateRouter } from "../../modules/template/template.routes";
import { guestRouter } from "../../modules/guest/guest.routes";
import { rsvpRouter } from "../../modules/rsvp/rsvp.routes";
import { userRouter } from "../../modules/user/user.routes";
import { dashboardRouter } from "../../modules/dashboard/dashboard.routes";
import { buwuhanRouter } from "../../modules/buwuhan/buwuhan.routes";
import { giftRouter } from "../../modules/gift/gift.routes";
import { subscriptionRouter } from "../../modules/subscription/subscription.routes";
import { checkSubscriptionExpiry } from "../../middlewares/subscription.middleware";

const v1Router = Router();

v1Router.use("/api", authRouter);
v1Router.use("/api", subscriptionRouter);

// Pasang lazy checkSubscriptionExpiry untuk rute-rute fitur utama setelah autentikasi
v1Router.use("/api", checkSubscriptionExpiry, invitationRouter);
v1Router.use("/api", templateRouter);
v1Router.use("/api", checkSubscriptionExpiry, guestRouter);
v1Router.use("/api", rsvpRouter);
v1Router.use("/api", userRouter);
v1Router.use("/api", dashboardRouter);
v1Router.use("/api", buwuhanRouter);
v1Router.use("/api", giftRouter);

export { v1Router };
