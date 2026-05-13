import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { Prisma, VacancyStatus } from '@prisma/client';

@Injectable()
export class VacanciesService {
    constructor(private prisma: PrismaService) {}

    private buildVacancyFilter(user?: any): Prisma.VacancyWhereInput {
        if (!user) return { status: VacancyStatus.APPROVED };
        if (['admin', 'superadmin'].includes(user.role)) return {};
        return {
            OR: [{ status: VacancyStatus.APPROVED }, { userId: user.sub }],
        };
    }

    async create(userId: string, dto: CreateVacancyDto) {
        return this.prisma.vacancy.create({
            data: { ...dto, userId },
        });
    }

    async findAll(user?: any) {
        return this.prisma.vacancy.findMany({
            where: this.buildVacancyFilter(user),
        });
    }

    async findOne(id: string, user?: any) {
        const isAdminOrSuper =
            user && ['admin', 'superadmin'].includes(user.role);

        const where: Prisma.VacancyWhereInput = { id };

        if (!isAdminOrSuper) {
            where.OR = user
                ? [{ status: VacancyStatus.APPROVED }, { userId: user.sub }]
                : [{ status: VacancyStatus.APPROVED }];
        }

        const vacancy = await this.prisma.vacancy.findFirst({ where });
        if (!vacancy) throw new NotFoundException('Vacancy not found');
        return vacancy;
    }

    async remove(id: string, user: any) {
        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
        });

        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        if (
            user.role !== 'admin' &&
            user.role !== 'superadmin' &&
            vacancy.userId !== user.sub
        ) {
            throw new ForbiddenException('Not allowed');
        }

        return this.prisma.vacancy.delete({ where: { id } });
    }
}
