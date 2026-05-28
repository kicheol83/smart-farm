import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, QUEUES } from '../../libs/types/common';

export interface EmailJobData {
  memberEmail: string;
  memberFullName: string;
  otp: string;
}

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: true,
  removeOnFail: 50,
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue) {}

  async sendEmailVerificationOtp(
    memberEmail: string,
    memberFullName: string,
    otp: string,
  ): Promise<void> {
    await this.emailQueue.add(
      JOBS.SEND_EMAIL_VERIFICATION,
      { memberEmail, memberFullName, otp } satisfies EmailJobData,
      JOB_OPTIONS,
    );
    this.logger.log(`Email verification OTP queued → ${memberEmail}`);
  }

  async sendPasswordResetOtp(
    memberEmail: string,
    memberFullName: string,
    otp: string,
  ): Promise<void> {
    await this.emailQueue.add(
      JOBS.SEND_PASSWORD_RESET,
      { memberEmail, memberFullName, otp } satisfies EmailJobData,
      JOB_OPTIONS,
    );
    this.logger.log(`Password reset OTP queued → ${memberEmail}`);
  }
}
