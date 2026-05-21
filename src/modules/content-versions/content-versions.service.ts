import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ContentVersionsService {
    constructor(private readonly prisma: PrismaService) {}

    async createVersion(entityType: string, entityId: string, data: any, createdBy?: string) {
        const lastVersion = await this.prisma.contentVersion.findFirst({
            where: { entityType, entityId },
            orderBy: { version: 'desc' },
            select: { version: true },
        });

        return this.prisma.contentVersion.create({
            data: {
                entityType,
                entityId,
                data,
                version: (lastVersion?.version ?? 0) + 1,
                createdBy,
            },
        });
    }

    async findByEntity(entityType: string, entityId: string) {
        return this.prisma.contentVersion.findMany({
            where: { entityType, entityId },
            orderBy: { version: 'desc' },
        });
    }

    async findOne(id: string) {
        const version = await this.prisma.contentVersion.findUnique({
            where: { id },
        });

        if (!version) {
            throw new NotFoundException('Content version not found');
        }

        return version;
    }
}
