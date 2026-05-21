import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../auth/constants/permissions.constants';
import { CompanyPermission } from '../../auth/decorators/company-permission.decorator';
import { CompanyAccessGuard } from '../../auth/guards/company-access/company-access.guard';
import { CompanySiteSettingsService } from './company-site-settings.service';
import { UpsertCompanySiteSettingsDto } from './dto/upsert-company-site-settings.dto';

@ApiBearerAuth()
@ApiTags('Company Site Settings')
@Controller('companies/:companyId/site-settings')
@UseGuards(CompanyAccessGuard)
@CompanyPermission(PERMISSIONS.COMPANY.SITE_SETTINGS_MANAGE)
export class CompanySiteSettingsController {
    constructor(
        private readonly siteSettingsService: CompanySiteSettingsService,
    ) {}

    @ApiOperation({ summary: 'Get company site settings' })
    @Get()
    findByCompany(@Param('companyId') companyId: string) {
        return this.siteSettingsService.findByCompany(companyId);
    }

    @ApiOperation({ summary: 'Create or update company site settings' })
    @Put()
    upsert(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: UpsertCompanySiteSettingsDto,
    ) {
        return this.siteSettingsService.upsert(companyId, req.user, dto, req);
    }
}
