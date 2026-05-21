import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService],
})
export class TagsModule {}
