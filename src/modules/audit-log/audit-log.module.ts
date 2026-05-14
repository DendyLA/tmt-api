import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { DatabaseModule } from '../../database/database.module';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditListener } from './audit.listener/audit.listener';

@Module({
    imports: [DatabaseModule],
    providers: [AuditLogService, PrismaService, AuditListener],
    exports: [AuditLogService],
})
export class AuditLogModule {}
