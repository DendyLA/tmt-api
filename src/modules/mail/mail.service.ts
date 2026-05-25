import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

type SendMailPayload = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter?: Transporter;

    async send(payload: SendMailPayload) {
        if (!this.isConfigured()) {
            this.logger.warn(
                `SMTP is not configured. Email skipped: to=${payload.to}, subject=${payload.subject}`,
            );
            return { sent: false, skipped: true };
        }

        await this.getTransporter().sendMail({
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
            ...payload,
        });

        return { sent: true };
    }

    private isConfigured() {
        return Boolean(
            process.env.SMTP_HOST &&
                process.env.SMTP_PORT &&
                process.env.SMTP_USER &&
                process.env.SMTP_PASS,
        );
    }

    private getTransporter() {
        if (!this.transporter) {
            this.transporter = createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE !== 'false',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        return this.transporter;
    }
}
