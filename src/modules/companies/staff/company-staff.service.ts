import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ROLE_NAMES } from '../../auth/constants/permissions.constants';
import { AcceptCompanyStaffInviteDto } from './dto/accept-company-staff-invite.dto';
import { CreateCompanyStaffInviteDto } from './dto/create-company-staff-invite.dto';
import { InviteCompanyStaffDto } from './dto/invite-company-staff.dto';
import { UpdateCompanyStaffDto } from './dto/update-company-staff.dto';

@Injectable()
export class CompanyStaffService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findByCompany(companyId: string) {
        await this.ensureActiveCompany(companyId);

        return this.prisma.companyMember.findMany({
            where: { companyId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isBanned: true,
                    },
                },
                role: true,
            },
            orderBy: [{ joinedAt: 'desc' }],
        });
    }

    async invite(companyId: string, actor: any, dto: InviteCompanyStaffDto, req?: any) {
        await this.ensureActiveCompany(companyId);

        if (!dto.userId && !dto.email) {
            throw new BadRequestException('userId or email is required');
        }

        const user = dto.userId
            ? await this.prisma.user.findUnique({ where: { id: dto.userId } })
            : await this.prisma.user.findUnique({ where: { email: dto.email } });

        if (!user) throw new NotFoundException('User not found');
        if (user.isBanned) throw new BadRequestException('User is banned');

        if (dto.roleId) {
            await this.ensureRole(dto.roleId);
        }

        const member = await this.prisma.companyMember.upsert({
            where: {
                companyId_userId: {
                    companyId,
                    userId: user.id,
                },
            },
            update: {
                roleId: dto.roleId,
                isOwner: dto.isOwner ?? false,
            },
            create: {
                companyId,
                userId: user.id,
                roleId: dto.roleId,
                isOwner: dto.isOwner ?? false,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                role: true,
            },
        });

        this.eventEmitter.emit('company.staff.invited', {
            user: actor,
            member,
            req,
        });

        return member;
    }

    async createInvite(
        companyId: string,
        actor: any,
        dto: CreateCompanyStaffInviteDto,
        req?: any,
    ) {
        await this.ensureActiveCompany(companyId);

        const email = dto.email.toLowerCase().trim();

        if (dto.roleId) {
            await this.ensureRole(dto.roleId);
        }

        await this.prisma.companyInvite.updateMany({
            where: {
                companyId,
                email,
                acceptedAt: null,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { revokedAt: new Date() },
        });

        const token = randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(token, 10);

        const invite = await this.prisma.companyInvite.create({
            data: {
                companyId,
                email,
                roleId: dto.roleId,
                isOwner: dto.isOwner ?? false,
                invitedBy: actor?.sub,
                tokenHash,
                expiresAt: this.getInviteExpiry(),
            },
            include: {
                company: { select: { id: true, name: true, slug: true } },
                role: true,
            },
        });

        this.eventEmitter.emit('company.staff.invite.created', {
            user: actor,
            invite,
            token,
            req,
        });

        const response: any = {
            invite: this.serializeInvite(invite),
        };

        if (process.env.NODE_ENV !== 'production') {
            response.token = token;
        }

        return response;
    }

    async previewInvite(token: string) {
        const invite = await this.findActiveInviteByToken(token);

        return this.serializeInvite({
            ...invite,
            company: {
                id: invite.company.id,
                name: invite.company.name,
                slug: invite.company.slug,
            },
        });
    }

    async acceptInvite(
        actor: any,
        dto: AcceptCompanyStaffInviteDto,
        req?: any,
    ) {
        const invite = await this.findActiveInviteByToken(dto.token);

        const user = await this.resolveInviteUser(invite.email, actor, dto);

        const member = await this.prisma.$transaction(async (tx) => {
            const createdMember = await tx.companyMember.upsert({
                where: {
                    companyId_userId: {
                        companyId: invite.companyId,
                        userId: user.id,
                    },
                },
                update: {
                    roleId: invite.roleId,
                    isOwner: invite.isOwner,
                },
                create: {
                    companyId: invite.companyId,
                    userId: user.id,
                    roleId: invite.roleId,
                    isOwner: invite.isOwner,
                },
                include: {
                    company: { select: { id: true, name: true, slug: true } },
                    user: { select: { id: true, name: true, email: true } },
                    role: true,
                },
            });

            await tx.companyInvite.update({
                where: { id: invite.id },
                data: {
                    acceptedAt: new Date(),
                    acceptedBy: user.id,
                },
            });

            return createdMember;
        });

        this.eventEmitter.emit('company.staff.invite.accepted', {
            user,
            invite,
            member,
            req,
        });

        return member;
    }

    async revokeInvite(companyId: string, id: string, actor: any, req?: any) {
        await this.ensureActiveCompany(companyId);

        const invite = await this.prisma.companyInvite.findFirst({
            where: {
                id,
                companyId,
                acceptedAt: null,
                revokedAt: null,
            },
            include: {
                company: { select: { id: true, name: true, slug: true } },
                role: true,
            },
        });

        if (!invite) throw new NotFoundException('Company invite not found');

        const revoked = await this.prisma.companyInvite.update({
            where: { id },
            data: { revokedAt: new Date() },
            include: {
                company: { select: { id: true, name: true, slug: true } },
                role: true,
            },
        });

        this.eventEmitter.emit('company.staff.invite.revoked', {
            user: actor,
            invite: revoked,
            req,
        });

        return this.serializeInvite(revoked);
    }

    async update(memberId: string, actor: any, dto: UpdateCompanyStaffDto, req?: any) {
        const member = await this.findMember(memberId);

        if (dto.roleId) {
            await this.ensureRole(dto.roleId);
        }

        const updated = await this.prisma.companyMember.update({
            where: { id: memberId },
            data: {
                roleId: dto.roleId,
                isOwner: dto.isOwner,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                role: true,
            },
        });

        this.eventEmitter.emit('company.staff.updated', {
            user: actor,
            before: member,
            after: updated,
            req,
        });

        return updated;
    }

    async remove(memberId: string, actor: any, req?: any) {
        const member = await this.findMember(memberId);

        await this.prisma.companyMember.delete({ where: { id: memberId } });

        this.eventEmitter.emit('company.staff.removed', {
            user: actor,
            member,
            req,
        });

        return { success: true };
    }

    private async findMember(id: string) {
        const member = await this.prisma.companyMember.findUnique({
            where: { id },
        });

        if (!member) throw new NotFoundException('Company member not found');
        return member;
    }

    private async ensureActiveCompany(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            select: { id: true, deletedAt: true },
        });

        if (!company || company.deletedAt) {
            throw new NotFoundException('Company not found');
        }
    }

    private async ensureRole(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!role) throw new NotFoundException('Role not found');
    }

    private async findActiveInviteByToken(token: string) {
        const invites = await this.prisma.companyInvite.findMany({
            where: {
                acceptedAt: null,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                company: { select: { id: true, name: true, slug: true, deletedAt: true } },
                role: true,
            },
        });

        for (const invite of invites) {
            if (await bcrypt.compare(token, invite.tokenHash)) {
                if (invite.company.deletedAt) {
                    throw new NotFoundException('Company not found');
                }

                return invite;
            }
        }

        throw new BadRequestException('Invalid or expired invite');
    }

    private async resolveInviteUser(
        inviteEmail: string,
        actor: any,
        dto: AcceptCompanyStaffInviteDto,
    ) {
        if (actor?.sub) {
            const user = await this.prisma.user.findUnique({
                where: { id: actor.sub },
            });

            if (!user) throw new NotFoundException('User not found');
            if (user.isBanned) throw new BadRequestException('User is banned');
            if (user.email.toLowerCase() !== inviteEmail) {
                throw new BadRequestException(
                    'Invite email does not match authenticated user',
                );
            }

            return user;
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: inviteEmail },
        });

        if (existingUser) {
            if (existingUser.isBanned) {
                throw new BadRequestException('User is banned');
            }

            return existingUser;
        }

        if (!dto.name || !dto.password) {
            throw new BadRequestException(
                'name and password are required for new invited users',
            );
        }

        const defaultRole = await this.prisma.role.findUnique({
            where: { name: ROLE_NAMES.USER },
            select: { id: true },
        });

        if (!defaultRole) throw new BadRequestException('Default role not found');

        return this.prisma.user.create({
            data: {
                name: dto.name,
                email: inviteEmail,
                password: await bcrypt.hash(dto.password, 10),
                roleId: defaultRole.id,
            },
        });
    }

    private getInviteExpiry() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return expiresAt;
    }

    private serializeInvite(invite: any) {
        const { tokenHash, ...safeInvite } = invite;
        return safeInvite;
    }
}
