import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from './mail.service';

@Injectable()
export class MailListener {
    constructor(private readonly mailService: MailService) {}

    @OnEvent('auth.emailVerification.created')
    async handleEmailVerificationCreated(payload: any) {
        const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
        const verifyUrl = `${appUrl}/auth/verify-email?token=${payload.token}`;

        await this.mailService.send({
            to: payload.user.email,
            subject: 'Confirm your email',
            text: `Confirm your email: ${verifyUrl}`,
            html: `<p>Confirm your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        });
    }

    @OnEvent('company.staff.invite.created')
    async handleCompanyStaffInviteCreated(payload: any) {
        const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
        const acceptUrl = `${appUrl}/staff/invites/accept?token=${payload.token}`;

        await this.mailService.send({
            to: payload.invite.email,
            subject: `Invitation to ${payload.invite.company?.name ?? 'company'}`,
            text: `Accept invitation: ${acceptUrl}`,
            html: `<p>You have been invited to ${payload.invite.company?.name ?? 'company'}.</p><p><a href="${acceptUrl}">${acceptUrl}</a></p>`,
        });
    }
}
