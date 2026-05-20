import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CompanyPartnersService } from './company-partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@ApiTags('Company Partners')
@Controller()
export class CompanyPartnersController {
    constructor(private readonly partnersService: CompanyPartnersService) {}

    @Public()
    @ApiOperation({ summary: 'Get active partners by company slug' })
    @Get('companies/:slug/partners')
    findByCompanySlug(@Param('slug') slug: string) {
        return this.partnersService.findByCompanySlug(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create company partner' })
    @Permissions(PERMISSIONS.COMPANY.PARTNER_MANAGE)
    @Post('companies/:companyId/partners')
    create(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreatePartnerDto,
    ) {
        return this.partnersService.create(companyId, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company partner' })
    @Permissions(PERMISSIONS.COMPANY.PARTNER_MANAGE)
    @Patch('company-partners/:id')
    update(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdatePartnerDto,
    ) {
        return this.partnersService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete company partner' })
    @Permissions(PERMISSIONS.COMPANY.PARTNER_MANAGE)
    @Delete('company-partners/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.partnersService.remove(id, req.user, req);
    }
}
