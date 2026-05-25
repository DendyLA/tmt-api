import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { MaintenanceService } from './maintenance.service';

@Module({
    imports: [AuthModule, MediaModule],
    providers: [MaintenanceService],
})
export class MaintenanceModule {}
