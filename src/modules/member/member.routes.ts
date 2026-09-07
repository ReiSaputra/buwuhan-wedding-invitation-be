import { Router } from "express";
import { MemberController } from "./member.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { acceptInviteSchema, inviteMemberSchema, updateMemberRoleSchema } from "./member.schema";

const memberRouter = Router();

// Accept invitation token (authenticated user)
memberRouter.post("/members/accept", requireAuth, validate(acceptInviteSchema), MemberController.accept);

// Invite member to invitation (OWNER only)
memberRouter.post(
  "/invitations/:invitationId/members",
  requireAuth,
  requireInvitationRole("OWNER"),
  validate(inviteMemberSchema),
  MemberController.invite,
);

// Resend invitation email (OWNER only)
memberRouter.post(
  "/invitations/:invitationId/members/:id/resend",
  requireAuth,
  requireInvitationRole("OWNER"),
  MemberController.resendInvite,
);

// List members of invitation (OWNER, ADMIN)
memberRouter.get(
  "/invitations/:invitationId/members",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN"),
  MemberController.list,
);

// Get member detail (OWNER, ADMIN)
memberRouter.get(
  "/invitations/:invitationId/members/:id",
  requireAuth,
  requireInvitationRole("OWNER", "ADMIN"),
  MemberController.getById,
);

// Update member role (OWNER only)
memberRouter.patch(
  "/invitations/:invitationId/members/:id",
  requireAuth,
  requireInvitationRole("OWNER"),
  validate(updateMemberRoleSchema),
  MemberController.updateRole,
);

// Remove member (OWNER only)
memberRouter.delete(
  "/invitations/:invitationId/members/:id",
  requireAuth,
  requireInvitationRole("OWNER"),
  MemberController.remove,
);

export { memberRouter };

