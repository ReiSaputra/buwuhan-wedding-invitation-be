export interface InvitationEmailData {
  guestName: string;
  guestEmail: string;
  qrCode: string;
  invitationTitle: string;
  invitationSlug: string;
  invitationUrl: string;
  coupleNames?: string | undefined;
  eventDate?: Date | string | null | undefined;
  eventTime?: string | null | undefined;
  venue?: string | null | undefined;
  address?: string | null | undefined;
}

export function generateInvitationEmailHtml(data: InvitationEmailData): string {
  const coupleHeader = data.coupleNames ? `<h2 style="margin: 5px 0 20px 0; color: #4b5563; font-weight: 500; font-size: 18px;">${escapeHtml(data.coupleNames)}</h2>` : "";
  const dateFormatted = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Undangan Digital - ${escapeHtml(data.invitationTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; margin-bottom: 16px; color: #374151; }
    .event-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .info-row { margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-val { font-size: 15px; color: #111827; margin-top: 2px; }
    .qr-box { text-align: center; background: #faf5ff; border: 2px dashed #c084fc; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .qr-token { font-family: monospace; font-size: 22px; font-weight: 700; color: #6b21a8; letter-spacing: 2px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${escapeHtml(data.invitationTitle)}</h1>
    </div>
    <div class="content">
      <div class="greeting">
        Kepada Yth. <strong>${escapeHtml(data.guestName)}</strong>,
      </div>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir dan memberikan doa restu pada momen bahagia kami.
      </p>

      ${coupleHeader}

      <div class="event-info">
        ${dateFormatted ? `<div class="info-row"><div class="info-label">Tanggal Acara</div><div class="info-val">${dateFormatted}</div></div>` : ""}
        ${data.eventTime ? `<div class="info-row"><div class="info-label">Waktu</div><div class="info-val">${escapeHtml(data.eventTime)}</div></div>` : ""}
        ${data.venue ? `<div class="info-row"><div class="info-label">Tempat / Lokasi</div><div class="info-val">${escapeHtml(data.venue)}</div></div>` : ""}
        ${data.address ? `<div class="info-row"><div class="info-label">Alamat</div><div class="info-val">${escapeHtml(data.address)}</div></div>` : ""}
      </div>

      <div class="qr-box">
        <div style="font-size: 13px; color: #7e22ce; font-weight: 600; margin-bottom: 6px;">KODE TIKET PRESENSI ANDA</div>
        <div class="qr-token">${escapeHtml(data.qrCode)}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">Tunjukkan kode QR / token ini kepada penerima tamu saat tiba di lokasi.</div>
      </div>

      <div class="btn-container">
        <a href="${data.invitationUrl}" class="btn" target="_blank" rel="noopener noreferrer">
          Buka Undangan Digital
        </a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 20px;">
        Atau buka tautan berikut melalui browser Anda:<br>
        <a href="${data.invitationUrl}" style="color: #4f46e5; word-break: break-all;">${data.invitationUrl}</a>
      </p>
    </div>
    <div class="footer">
      Email ini dikirim secara otomatis melalui sistem undangan digital Buwuhan.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateInvitationEmailText(data: InvitationEmailData): string {
  const coupleText = data.coupleNames ? `\nPasangan: ${data.coupleNames}` : "";
  const dateFormatted = data.eventDate ? `\nTanggal: ${new Date(data.eventDate).toLocaleDateString("id-ID")}` : "";
  const timeText = data.eventTime ? `\nWaktu: ${data.eventTime}` : "";
  const venueText = data.venue ? `\nTempat: ${data.venue}` : "";
  const addressText = data.address ? `\nAlamat: ${data.address}` : "";

  return `
Halo ${data.guestName},

Anda diundang untuk menghadiri:
${data.invitationTitle}${coupleText}${dateFormatted}${timeText}${venueText}${addressText}

Kode Tiket Presensi: ${data.qrCode}
Tautan Undangan Digital: ${data.invitationUrl}

Terima kasih atas kehadiran dan doa restu Anda.
  `.trim();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
