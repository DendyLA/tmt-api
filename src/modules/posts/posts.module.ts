import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { ContentVersionsModule } from '../content-versions/content-versions.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
    imports: [DatabaseModule, AuthModule, AuditLogModule, ContentVersionsModule],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
