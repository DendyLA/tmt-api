import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
    imports: [DatabaseModule, AuthModule, AuditLogModule],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
