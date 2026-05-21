import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalMediaStorageService } from './storage/local-media-storage.service';

@Module({
    imports: [DatabaseModule, AuthModule, AuditLogModule],
    controllers: [MediaController],
    providers: [MediaService, LocalMediaStorageService],
    exports: [MediaService],
})
export class MediaModule {}
