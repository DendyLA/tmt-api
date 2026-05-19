import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { VacancyModerationController } from './moderation/vacancy-moderation.controller';
import { VacancyModerationService } from './moderation/vacancy-moderation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuditLogModule, AuthModule],
    controllers: [VacanciesController, VacancyModerationController],
    providers: [VacanciesService, VacancyModerationService],
})
export class VacanciesModule {}
