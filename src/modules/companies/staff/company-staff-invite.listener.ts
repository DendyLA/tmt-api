import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CompanyStaffInviteListener {
    private readonly logger = new Logger(CompanyStaffInviteListener.name);

    @OnEvent('company.staff.invite.created')
    async handleInviteCreated(payload: any) {
        const invite = payload.invite;
        const company = invite?.company;
        const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
        const acceptUrl = `${appUrl}/staff/invites/accept?token=${payload.token}`;

        this.logger.log(
            `Company staff invite queued: email=${invite.email}, company=${company?.slug ?? invite.companyId}, acceptUrl=${acceptUrl}`,
        );
    }
}
