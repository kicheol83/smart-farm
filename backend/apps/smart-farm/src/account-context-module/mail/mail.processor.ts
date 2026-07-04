import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { QUEUES, JOBS } from '../../libs/types/common';
import { EmailJobData } from './mail.service';

@Processor(QUEUES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.resend = new Resend(config.getOrThrow('RESEND_API_KEY'));
    this.from = config.getOrThrow('MAIL_FROM');
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { memberEmail, memberFullName, otp } = job.data;

    this.logger.log(
      `Processing | job=${job.id} name=${job.name} attempt=${job.attemptsMade + 1} → ${memberEmail}`,
    );

    switch (job.name) {
      case JOBS.SEND_EMAIL_VERIFICATION:
        await this.send(
          memberEmail,
          'Verify your email address',
          this.verificationTemplate(memberFullName, otp),
        );
        break;

      case JOBS.SEND_PASSWORD_RESET:
        await this.send(
          memberEmail,
          'Reset your password',
          this.passwordResetTemplate(memberFullName, otp),
        );
        break;

      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error(`Resend error → ${to}: ${error.message}`);
      throw new Error(error.message);
    }

    this.logger.log(`Email sent → ${to}`);
  }

  private verificationTemplate(memberFullName: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#1a1a1a;">
          <h2>Hi, ${memberFullName}!</h2>
          <p>Use the code below to verify your email address.</p>
          <p>It expires in <strong>5 minutes</strong>.</p>
          <div style="
            font-size:40px;font-weight:700;letter-spacing:14px;
            padding:24px 32px;background:#f0f9f0;
            border:1px solid #c3e6c3;border-radius:12px;
            text-align:center;margin:24px 0;
          ">${otp}</div>
          <p style="color:#999;font-size:12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </body>
      </html>
    `;
  }

  private passwordResetTemplate(memberFullName: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#1a1a1a;">
          <h2>Hi, ${memberFullName}!</h2>
          <p>Use the code below to reset your password.</p>
          <p>It expires in <strong>5 minutes</strong>.</p>
          <div style="
            font-size:40px;font-weight:700;letter-spacing:14px;
            padding:24px 32px;background:#fff5f5;
            border:1px solid #f5c6c6;border-radius:12px;
            text-align:center;margin:24px 0;
          ">${otp}</div>
          <p style="color:#999;font-size:12px;">
            If you didn't request a password reset, please secure your account immediately.
          </p>
        </body>
      </html>
    `;
  }
}
