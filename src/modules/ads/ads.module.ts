import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule {}
