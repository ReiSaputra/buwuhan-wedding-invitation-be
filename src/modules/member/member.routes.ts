import { Router } from "express";
import { MemberController } from "./member.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireInvitationRole } from "../../middlewares/invitation-role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { acceptInviteSchema, instantAccessSchema, instantLinkSchema, inviteMemberSchema, updateMemberRoleSchema } from "./member.schema";

const memberRouter = Router();

// ── Akses Instan Petugas (Magic Link) ──────────────────────────────────────

// Publik: Petugas menukar token magic link → JWT session (tanpa login akun platform)
memberRouter.post("/members/instant-access", validate(instantAccessSchema), MemberController.instantAccess);

// Owner: Generate magic link baru untuk petugas (tanpa perlu email petugas)
memberRouter.post("/invitations/:invitationId/members/instant-link", requireAuth, requireInvitationRole("OWNER"), validate(instantLinkSchema), MemberController.generateInstantLink);

// ── Undangan Email Petugas (Sistem Lama) ────────────────────────────────────

// Accept invitation token (authenticated user)
memberRouter.post("/members/accept", requireAuth, validate(acceptInviteSchema), MemberController.accept);

// Invite member to invitation (OWNER only)
memberRouter.post("/invitations/:invitationId/members", requireAuth, requireInvitationRole("OWNER"), validate(inviteMemberSchema), MemberController.invite);
memberRouter.post("/invitations/:invitationId/members", requireAuth, requireInvitationRole("OWNER"), validate(inviteMemberSchema), MemberController.invite);

// Resend invitation email (OWNER only)
memberRouter.post("/invitations/:invitationId/members/:id/resend", requireAuth, requireInvitationRole("OWNER"), MemberController.resendInvite);
memberRouter.post("/invitations/:invitationId/members/:id/resend", requireAuth, requireInvitationRole("OWNER"), MemberController.resendInvite);

// List members of invitation (OWNER, ADMIN)
memberRouter.get("/invitations/:invitationId/members", requireAuth, requireInvitationRole("OWNER", "ADMIN"), MemberController.list);
memberRouter.get("/invitations/:invitationId/members", requireAuth, requireInvitationRole("OWNER", "ADMIN"), MemberController.list);

// Get member detail (OWNER, ADMIN)
memberRouter.get("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN"), MemberController.getById);
memberRouter.get("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER", "ADMIN"), MemberController.getById);

// Update member role (OWNER only)
memberRouter.patch("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER"), validate(updateMemberRoleSchema), MemberController.updateRole);
memberRouter.patch("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER"), validate(updateMemberRoleSchema), MemberController.updateRole);

// Remove member (OWNER only)
memberRouter.delete("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER"), MemberController.remove);
memberRouter.delete("/invitations/:invitationId/members/:id", requireAuth, requireInvitationRole("OWNER"), MemberController.remove);

export { memberRouter };
