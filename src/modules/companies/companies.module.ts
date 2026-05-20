import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { CompanyContactsController } from './contacts/company-contacts.controller';
import { CompanyContactsService } from './contacts/company-contacts.service';
import { CompanyProjectsController } from './projects/company-projects.controller';
import { CompanyProjectsService } from './projects/company-projects.service';
import { CompanyPartnersController } from './partners/company-partners.controller';
import { CompanyPartnersService } from './partners/company-partners.service';
import { CompanyServicesController } from './services/company-services.controller';
import { CompanyServicesService } from './services/company-services.service';
import { CompanySocialLinksController } from './social-links/company-social-links.controller';
import { CompanySocialLinksService } from './social-links/company-social-links.service';
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
