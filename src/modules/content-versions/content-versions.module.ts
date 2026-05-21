import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ContentVersionsController } from './content-versions.controller';
import { ContentVersionsService } from './content-versions.service';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [ContentVersionsController],
    providers: [ContentVersionsService],
    exports: [ContentVersionsService],
})
export class ContentVersionsModule {}
