import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) {}

    async log(data: {
        userId?: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.activityLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                metadata: data.metadata ?? undefined,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
}
