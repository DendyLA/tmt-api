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
import { CompanySocialLinksService } from './company-social-links.service';
import { CreateCompanySocialLinkDto } from './dto/create-company-social-link.dto';
import { UpdateCompanySocialLinkDto } from './dto/update-company-social-link.dto';

@ApiTags('Company Social Links')
@Controller()
export class CompanySocialLinksController {
    constructor(
        private readonly socialLinksService: CompanySocialLinksService,
    ) {}

    @Public()
    @ApiOperation({ summary: 'Get public social links by company slug' })
    @Get('companies/:slug/social-links')
    findByCompanySlug(@Param('slug') slug: string) {
        return this.socialLinksService.findByCompanySlug(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create company social link' })
    @Permissions(PERMISSIONS.COMPANY.SOCIAL_MANAGE)
    @Post('companies/:companyId/social-links')
    create(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreateCompanySocialLinkDto,
    ) {
        return this.socialLinksService.create(companyId, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company social link' })
    @Permissions(PERMISSIONS.COMPANY.SOCIAL_MANAGE)
    @Patch('company-social-links/:id')
    update(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateCompanySocialLinkDto,
    ) {
        return this.socialLinksService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete company social link' })
    @Permissions(PERMISSIONS.COMPANY.SOCIAL_MANAGE)
    @Delete('company-social-links/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.socialLinksService.remove(id, req.user, req);
    }
}
