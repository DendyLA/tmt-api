import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
    imports: [DatabaseModule],
    controllers: [SiteController],
    providers: [SiteService],
})
export class SiteModule {}
