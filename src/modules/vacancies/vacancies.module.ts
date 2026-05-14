import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { DatabaseModule } from '../../database/database.module';
import { VacancyOwnershipGuard } from '../auth/guards/ownership/vacancy-ownership.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ModerationController } from './moderation/moderation.controller';
import { VacancyModerationService } from './moderation/vacancy-moderation.service';

@Module({
    imports: [DatabaseModule, AuditLogModule],
    controllers: [VacanciesController, ModerationController],
    providers: [
        VacanciesService,
        VacancyOwnershipGuard,
        VacancyModerationService,
    ],
})
export class VacanciesModule {}
