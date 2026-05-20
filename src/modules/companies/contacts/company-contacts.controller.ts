import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../auth/constants/permissions.constants';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CompanyContactsService } from './company-contacts.service';
import { UpsertCompanyContactDto } from './dto/upsert-company-contact.dto';

@ApiTags('Company Contacts')
@Controller('companies')
export class CompanyContactsController {
    constructor(private readonly contactsService: CompanyContactsService) {}

    @Public()
    @ApiOperation({ summary: 'Get public company contact by company slug' })
    @Get(':slug/contact')
    findByCompanySlug(@Param('slug') slug: string) {
        return this.contactsService.findByCompanySlug(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create or update company contact' })
    @Permissions(PERMISSIONS.COMPANY.CONTACT_MANAGE)
    @Put(':companyId/contact')
    upsert(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: UpsertCompanyContactDto,
    ) {
        return this.contactsService.upsert(companyId, req.user, dto, req);
    }
}
