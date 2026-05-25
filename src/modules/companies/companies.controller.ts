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
import { LocaleQueryDto } from '../../common/dto/locale-query.dto';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create company' })
    @Permissions(PERMISSIONS.COMPANY.CREATE)
    @Post()
    create(@Req() req: any, @Body() dto: CreateCompanyDto) {
        return this.companiesService.create(req.user, dto, req);
    }

    @Public()
    @ApiOperation({ summary: 'List public companies' })
    @Get()
    findAll(@Query() query?: LocaleQueryDto) {
        return query?.locale
            ? this.companiesService.findAll(query.locale)
            : this.companiesService.findAll();
    }

    @Public()
    @ApiOperation({ summary: 'Get public company by slug' })
    @Get(':slug')
    findOneBySlug(@Param('slug') slug: string, @Query() query?: LocaleQueryDto) {
        return query?.locale
            ? this.companiesService.findOneBySlug(slug, query.locale)
            : this.companiesService.findOneBySlug(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company' })
    @Permissions(PERMISSIONS.COMPANY.UPDATE)
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateCompanyDto,
    ) {
        return this.companiesService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete company' })
    @Permissions(PERMISSIONS.COMPANY.DELETE)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.companiesService.remove(id, req.user, req);
    }
}
