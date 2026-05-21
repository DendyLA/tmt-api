import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma/prisma.service';
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
}
