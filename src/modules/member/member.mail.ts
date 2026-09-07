import type { InvitationRole } from "../../generated/prisma/client";

export interface MemberInviteEmailData {
  inviterName: string;
  memberName: string;
  memberEmail: string;
  role: InvitationRole;
  invitationTitle: string;
  invitationSlug: string;
  acceptUrl: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getRoleLabel(role: InvitationRole): string {
  switch (role) {
    case "OWNER":
      return "Pemilik (Owner)";
    case "ADMIN":
      return "Admin Undangan (Co-host)";
    case "USER":
      return "Petugas Penerima Tamu (Usher)";
    default:
      return role;
  }
}

export function generateMemberInviteEmailHtml(data: MemberInviteEmailData): string {
  const roleLabel = getRoleLabel(data.role);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Undangan Bergabung sebagai Petugas - ${escapeHtml(data.invitationTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; margin-bottom: 16px; color: #374151; }
    .invite-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .info-row { margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-val { font-size: 15px; color: #111827; margin-top: 2px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #e0e7ff; color: #4338ca; font-weight: 600; font-size: 13px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    .note { font-size: 13px; color: #6b7280; margin-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Undangan Bergabung Petugas</h1>
    </div>
    <div class="content">
      <div class="greeting">
        Halo <strong>${escapeHtml(data.memberName)}</strong>,
      </div>
      <p style="color: #4b5563; line-height: 1.5;">
        <strong>${escapeHtml(data.inviterName)}</strong> mengundang Anda untuk bergabung mengelola acara <strong>${escapeHtml(data.invitationTitle)}</strong> pada platform Buwuhan Wedding Invitation.
      </p>

      <div class="invite-box">
        <div class="info-row">
          <div class="info-label">Nama Acara</div>
          <div class="info-val"><strong>${escapeHtml(data.invitationTitle)}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Peran yang Diberikan</div>
          <div class="info-val"><span class="badge">${escapeHtml(roleLabel)}</span></div>
        </div>
        <div class="info-row">
          <div class="info-label">Email Terdaftar</div>
          <div class="info-val">${escapeHtml(data.memberEmail)}</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${escapeHtml(data.acceptUrl)}" class="btn" target="_blank">Terima Undangan</a>
      </div>

      <p class="note">
        Tautan undangan ini bersifat pribadi dan hanya dapat digunakan satu kali.<br>
        Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:<br>
        <a href="${escapeHtml(data.acceptUrl)}" style="color: #4f46e5; word-break: break-all;">${escapeHtml(data.acceptUrl)}</a>
      </p>
    </div>
    <div class="footer">
      Email ini dikirim secara otomatis oleh Buwuhan Wedding Invitation System.<br>
      Jika Anda merasa tidak mengenali pengirim, silakan abaikan email ini.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateMemberInviteEmailText(data: MemberInviteEmailData): string {
  const roleLabel = getRoleLabel(data.role);

  return `
Halo ${data.memberName},

${data.inviterName} mengundang Anda untuk bergabung mengelola acara ${data.invitationTitle} sebagai ${roleLabel} pada platform Buwuhan Wedding Invitation.

Detail Undangan:
- Acara: ${data.invitationTitle}
- Peran: ${roleLabel}
- Email: ${data.memberEmail}

Silakan klik tautan berikut untuk menerima undangan:
${data.acceptUrl}

Tautan undangan ini bersifat pribadi dan hanya dapat digunakan satu kali.
Jika Anda merasa tidak mengenali pengirim, silakan abaikan email ini.
  `.trim();
}

