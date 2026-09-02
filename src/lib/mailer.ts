import nodemailer, { type Transporter, type SendMailOptions } from "nodemailer";
import { logger } from "../utils/log";

export interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class Mailer {
  private transporter: Transporter | null = null;

  public getTransporter(): Transporter {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = process.env.SMTP_SECURE === "true";
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        logger.info(`[Mailer] Initialized SMTP transporter for ${host}:${port}`);
      } else {
        // Fallback: JSON transporter untuk simulasi/logging (aman untuk dev/test)
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
        if (process.env.NODE_ENV !== "test") {
          logger.warn("[Mailer] SMTP credentials not fully configured. Using JSON fallback transporter.");
        }
      }
    }
    return this.transporter;
  }

  public async sendMail(payload: MailPayload): Promise<{ messageId?: string; accepted?: string[]; rejected?: string[] }> {
    const from = process.env.SMTP_FROM || `"Buwuhan Invitation" <noreply@buwuhan.com>`;
    const transporter = this.getTransporter();

    const mailOptions: SendMailOptions = {
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`[Mailer] Email sent to ${payload.to} with subject "${payload.subject}" (messageId: ${info.messageId})`);
      return info;
    } catch (error) {
      logger.error(`[Mailer] Failed to send email to ${payload.to}:`, error);
      throw error;
    }
  }

  // Helper untuk testing / reset instance
  public setTransporter(transporter: Transporter | null): void {
    this.transporter = transporter;
  }
}

export const mailer = new Mailer();
