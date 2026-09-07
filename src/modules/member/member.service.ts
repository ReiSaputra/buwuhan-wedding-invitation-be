import crypto from "crypto";
import { MemberRepository } from "./member.repository";
import {
  acceptInviteResponse,
  deleteMemberResponse,
  getMemberResponse,
  inviteMemberResponse,
  listMemberResponse,
  resendInviteResponse,
  updateMemberRoleResponse,
  type AcceptInviteRes,
  type DeleteMemberRes,
  type GetMemberRes,
  type InviteMemberReq,
  type InviteMemberRes,
  type ListMemberRes,
  type ResendInviteRes,
  type UpdateMemberRoleReq,
  type UpdateMemberRoleRes,
} from "./member.types";
import { ConflictError, EmailDeliveryError, ForbiddenError, NotFoundError, ValidationError } from "../../errors/app.error";
import { mailer } from "../../lib/mailer";
import { generateMemberInviteEmailHtml, generateMemberInviteEmailText } from "./member.mail";
import { logger } from "../../utils/log";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildAcceptUrl(rawToken: string): string {
  const baseUrl = process.env.FRONTEND_URL || "https://buwuhan.com";
  return `${baseUrl}/dashboard/undangan/join?token=${rawToken}`;
}

export class MemberService {
  static async invite(invitationId: string, currentUserId: string, request: InviteMemberReq): Promise<InviteMemberRes> {
    const invitation = await MemberRepository.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    if (invitation.owner.email.toLowerCase() === request.email.toLowerCase()) {
      throw new ConflictError("Pemilik undangan sudah memiliki akses penuh");
    }

    const existing = await MemberRepository.findByInvitationAndEmail(invitationId, request.email);
    if (existing) {
      if (existing.acceptedAt !== null && existing.revokedAt === null) {
        throw new ConflictError("Pengguna dengan email ini sudah menjadi anggota aktif");
      }
      if (existing.inviteTokenHash && existing.acceptedAt === null) {
        throw new ConflictError("Undangan untuk email ini sudah pernah dikirim. Silakan gunakan fitur kirim ulang.");
      }
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    let member;
    if (existing) {
      member = await MemberRepository.update(existing.id, {
        name: request.name,
        role: request.role ?? "USER",
        inviteTokenHash: tokenHash,
        inviteTokenExpiresAt: expiresAt,
        revokedAt: null,
      });
    } else {
      member = await MemberRepository.create({
        invitationId,
        email: request.email,
        name: request.name,
        role: request.role ?? "USER",
        inviteTokenHash: tokenHash,
        inviteTokenExpiresAt: expiresAt,
      });
    }

    const acceptUrl = buildAcceptUrl(rawToken);
    try {
      await mailer.sendMail({
        to: request.email,
        subject: `Undangan Bergabung Petugas - ${invitation.title}`,
        html: generateMemberInviteEmailHtml({
          inviterName: invitation.owner.fullName,
          memberName: request.name,
          memberEmail: request.email,
          role: member.role,
          invitationTitle: invitation.title,
          invitationSlug: invitation.slug,
          acceptUrl,
        }),
        text: generateMemberInviteEmailText({
          inviterName: invitation.owner.fullName,
          memberName: request.name,
          memberEmail: request.email,
          role: member.role,
          invitationTitle: invitation.title,
          invitationSlug: invitation.slug,
          acceptUrl,
        }),
      });
    } catch (error) {
      logger.error("Gagal mengirim email undangan petugas:", error);
      throw new EmailDeliveryError();
    }

    return inviteMemberResponse(member);
  }

  static async resendInvite(invitationId: string, memberId: string): Promise<ResendInviteRes> {
    const member = await MemberRepository.findById(memberId);
    if (!member || member.invitationId !== invitationId) {
      throw new NotFoundError("Petugas tidak ditemukan");
    }

    if (member.acceptedAt !== null) {
      throw new ConflictError("Petugas sudah menerima undangan sebelumnya");
    }

    const invitation = await MemberRepository.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await MemberRepository.updateToken(member.id, tokenHash, expiresAt);

    const acceptUrl = buildAcceptUrl(rawToken);
    try {
      await mailer.sendMail({
        to: member.email,
        subject: `[Kirim Ulang] Undangan Bergabung Petugas - ${invitation.title}`,
        html: generateMemberInviteEmailHtml({
          inviterName: invitation.owner.fullName,
          memberName: member.name,
          memberEmail: member.email,
          role: member.role,
          invitationTitle: invitation.title,
          invitationSlug: invitation.slug,
          acceptUrl,
        }),
        text: generateMemberInviteEmailText({
          inviterName: invitation.owner.fullName,
          memberName: member.name,
          memberEmail: member.email,
          role: member.role,
          invitationTitle: invitation.title,
          invitationSlug: invitation.slug,
          acceptUrl,
        }),
      });
    } catch (error) {
      logger.error("Gagal mengirim ulang email undangan petugas:", error);
      throw new EmailDeliveryError();
    }

    return resendInviteResponse(updated);
  }

  static async accept(token: string, userId: string): Promise<AcceptInviteRes> {
    const tokenHash = hashToken(token);
    const member = await MemberRepository.findByTokenHash(tokenHash);

    if (!member) {
      throw new NotFoundError("Token undangan tidak valid atau tidak ditemukan");
    }

    if (member.inviteTokenExpiresAt && member.inviteTokenExpiresAt < new Date()) {
      throw new ValidationError("Token undangan sudah kedaluwarsa");
    }

    if (member.revokedAt) {
      throw new ForbiddenError("Undangan ini telah dicabut");
    }

    const updated = await MemberRepository.acceptInvite(member.id, userId);

    return acceptInviteResponse(updated);
  }

  static async list(invitationId: string): Promise<ListMemberRes> {
    const members = await MemberRepository.findManyByInvitationId(invitationId);
    return listMemberResponse(members);
  }

  static async getById(invitationId: string, memberId: string): Promise<GetMemberRes> {
    const member = await MemberRepository.findById(memberId);
    if (!member || member.invitationId !== invitationId) {
      throw new NotFoundError("Petugas tidak ditemukan");
    }

    return getMemberResponse(member);
  }

  static async updateRole(invitationId: string, memberId: string, request: UpdateMemberRoleReq): Promise<UpdateMemberRoleRes> {
    const member = await MemberRepository.findById(memberId);
    if (!member || member.invitationId !== invitationId) {
      throw new NotFoundError("Petugas tidak ditemukan");
    }

    const updated = await MemberRepository.update(memberId, { role: request.role });
    return updateMemberRoleResponse(updated);
  }

  static async remove(invitationId: string, memberId: string): Promise<DeleteMemberRes> {
    const member = await MemberRepository.findById(memberId);
    if (!member || member.invitationId !== invitationId) {
      throw new NotFoundError("Petugas tidak ditemukan");
    }

    await MemberRepository.delete(memberId);
    return deleteMemberResponse();
  }
}

