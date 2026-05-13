import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { DatabaseModule } from '../../database/database.module';
import { VacancyOwnershipGuard } from '../auth/guards/ownership/vacancy-ownership.guard';

@Module({
    imports: [DatabaseModule],
    controllers: [VacanciesController],
    providers: [VacanciesService, VacancyOwnershipGuard],
})
export class VacanciesModule {}