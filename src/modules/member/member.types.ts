import type { InvitationMember, InvitationRole } from "../../generated/prisma/client";

export interface InviteMemberReq {
  email: string;
  name: string;
  role?: InvitationRole | undefined;
}

export interface UpdateMemberRoleReq {
  role?: InvitationRole | undefined;
  isRevoked?: boolean | undefined;
  status?: "ACTIVE" | "REVOKED" | "PASIF" | "INACTIVE" | undefined;
}

export interface AcceptInviteReq {
  token: string;
}

// Request untuk generate instant link petugas (tanpa email / registrasi akun)
export interface InstantLinkReq {
  name: string;
  role?: "USER";
}

// Request untuk menukar token instan → session JWT
export interface InstantAccessReq {
  token: string;
}

export interface MemberItemData {
  id: string;
  invitationId: string;
  userId: string | null;
  email: string;
  name: string;
  role: InvitationRole;
  invitedAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  isAccepted: boolean;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteMemberRes {
  message: string;
  status: number;
  data: MemberItemData;
}

export interface ListMemberRes {
  message: string;
  status: number;
  data: MemberItemData[];
}

export interface GetMemberRes {
  message: string;
  status: number;
  data: MemberItemData;
}

export interface UpdateMemberRoleRes {
  message: string;
  status: number;
  data: MemberItemData;
}

export interface DeleteMemberRes {
  message: string;
  status: number;
}

export interface ResendInviteRes {
  message: string;
  status: number;
  data: {
    memberId: string;
    email: string;
    name: string;
  };
}

export interface AcceptInviteRes {
  message: string;
  status: number;
  data: {
    memberId: string;
    invitationId: string;
    invitationSlug: string;
    invitationTitle: string;
    role: InvitationRole;
  };
}

// Response untuk generate instant link
export interface InstantLinkRes {
  message: string;
  status: number;
  data: {
    memberId: string;
    name: string;
    role: InvitationRole;
    accessLink: string;
    expiresAt: Date;
  };
}

// Response untuk instant access (penukaran token → JWT)
export interface InstantAccessRes {
  message: string;
  status: number;
  data: {
    sessionToken: string;
    access: {
      type: "INSTANT";
      scope: "BUWUHAN_ONLY";
      invitationId: string;
      memberId: string;
      invitationRole: "USER";
      canDeleteBuwuhan: boolean;
    };
    member: {
      id: string;
      name: string;
      role: InvitationRole;
    };
    invitation: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

// ── Helper formatters ────────────────────────────────────────────────

export function toMemberItemData(member: InvitationMember): MemberItemData {
  return {
    id: member.id,
    invitationId: member.invitationId,
    userId: member.userId,
    email: member.email,
    name: member.name,
    role: member.role,
    invitedAt: member.invitedAt,
    acceptedAt: member.acceptedAt,
    revokedAt: member.revokedAt,
    isAccepted: member.acceptedAt !== null,
    isRevoked: member.revokedAt !== null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function inviteMemberResponse(member: InvitationMember): InviteMemberRes {
  return {
    message: "Petugas berhasil diundang",
    status: 201,
    data: toMemberItemData(member),
  };
}

export function listMemberResponse(members: InvitationMember[]): ListMemberRes {
  return {
    message: "Daftar petugas berhasil diambil",
    status: 200,
    data: members.map(toMemberItemData),
  };
}

export function getMemberResponse(member: InvitationMember): GetMemberRes {
  return {
    message: "Data petugas berhasil diambil",
    status: 200,
    data: toMemberItemData(member),
  };
}

export function updateMemberRoleResponse(member: InvitationMember): UpdateMemberRoleRes {
  return {
    message: "Peran petugas berhasil diperbarui",
    status: 200,
    data: toMemberItemData(member),
  };
}

export function deleteMemberResponse(): DeleteMemberRes {
  return {
    message: "Petugas berhasil dihapus",
    status: 200,
  };
}

export function resendInviteResponse(member: InvitationMember): ResendInviteRes {
  return {
    message: "Undangan petugas berhasil dikirim ulang",
    status: 200,
    data: {
      memberId: member.id,
      email: member.email,
      name: member.name,
    },
  };
}

export function acceptInviteResponse(member: InvitationMember & { invitation: { slug: string; title: string } }): AcceptInviteRes {
  return {
    message: "Undangan petugas berhasil diterima",
    status: 200,
    data: {
      memberId: member.id,
      invitationId: member.invitationId,
      invitationSlug: member.invitation.slug,
      invitationTitle: member.invitation.title,
      role: member.role,
    },
  };
}
