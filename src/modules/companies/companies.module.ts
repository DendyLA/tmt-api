import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { CompanyContactsController } from './company-contacts.controller';
import { CompanyContactsService } from './company-contacts.service';
import { CompanyProjectsController } from './company-projects.controller';
import { CompanyProjectsService } from './company-projects.service';
import { CompanyPartnersController } from './company-partners.controller';
import { CompanyPartnersService } from './company-partners.service';
import { CompanyServicesController } from './company-services.controller';
import { CompanyServicesService } from './company-services.service';
import { CompanySocialLinksController } from './company-social-links.controller';
import { CompanySocialLinksService } from './company-social-links.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
    imports: [DatabaseModule, AuthModule, AuditLogModule],
    controllers: [
        CompaniesController,
        CompanyContactsController,
        CompanySocialLinksController,
        CompanyProjectsController,
        CompanyServicesController,
        CompanyPartnersController,
    ],
    providers: [
        CompaniesService,
        CompanyContactsService,
        CompanySocialLinksService,
        CompanyProjectsService,
        CompanyServicesService,
        CompanyPartnersService,
    ],
    exports: [
        CompaniesService,
        CompanyContactsService,
        CompanySocialLinksService,
        CompanyProjectsService,
        CompanyServicesService,
        CompanyPartnersService,
    ],
})
export class CompaniesModule {}
