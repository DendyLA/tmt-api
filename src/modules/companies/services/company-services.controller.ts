import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocaleQueryDto } from '../../../common/dto/locale-query.dto';
import { PERMISSIONS } from '../../auth/constants/permissions.constants';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CompanyServicesService } from './company-services.service';
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateCompanyServiceDto } from './dto/update-company-service.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@ApiTags('Company Services')
@Controller()
export class CompanyServicesController {
    constructor(private readonly companyServices: CompanyServicesService) {}

    @Public()
    @ApiOperation({ summary: 'Get service categories by company slug' })
    @Get('companies/:slug/service-categories')
    findCategoriesByCompanySlug(
        @Param('slug') slug: string,
        @Query() query: LocaleQueryDto,
    ) {
        return this.companyServices.findCategoriesByCompanySlug(
            slug,
            query.locale,
        );
    }

    @Public()
    @ApiOperation({ summary: 'Get services by company slug' })
    @Get('companies/:slug/services')
    findServicesByCompanySlug(
        @Param('slug') slug: string,
        @Query() query: LocaleQueryDto,
    ) {
        return this.companyServices.findServicesByCompanySlug(
            slug,
            query.locale,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create service category' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Post('companies/:companyId/service-categories')
    createCategory(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreateServiceCategoryDto,
    ) {
        return this.companyServices.createCategory(
            companyId,
            req.user,
            dto,
            req,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update service category' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Patch('service-categories/:id')
    updateCategory(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateServiceCategoryDto,
    ) {
        return this.companyServices.updateCategory(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete service category' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Delete('service-categories/:id')
    removeCategory(@Param('id') id: string, @Req() req: any) {
        return this.companyServices.removeCategory(id, req.user, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create company service' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Post('companies/:companyId/services')
    createService(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreateCompanyServiceDto,
    ) {
        return this.companyServices.createService(
            companyId,
            req.user,
            dto,
            req,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company service' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Patch('company-services/:id')
    updateService(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateCompanyServiceDto,
    ) {
        return this.companyServices.updateService(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete company service' })
    @Permissions(PERMISSIONS.COMPANY.SERVICE_MANAGE)
    @Delete('company-services/:id')
    removeService(@Param('id') id: string, @Req() req: any) {
        return this.companyServices.removeService(id, req.user, req);
    }
}
