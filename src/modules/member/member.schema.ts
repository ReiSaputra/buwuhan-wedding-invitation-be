import * as z from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  name: z.string().trim().min(1, "Nama petugas wajib diisi").max(255, "Nama maksimal 255 karakter"),
  role: z.enum(["OWNER", "ADMIN", "USER"]).optional().default("USER"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "USER"]),
});

export const acceptInviteSchema = z.object({
  token: z.string().trim().min(1, "Token undangan wajib disertakan"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
