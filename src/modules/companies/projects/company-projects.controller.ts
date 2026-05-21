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
import { PERMISSIONS } from '../../auth/constants/permissions.constants';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CompanyProjectsService } from './company-projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Company Projects')
@Controller()
export class CompanyProjectsController {
    constructor(private readonly projectsService: CompanyProjectsService) {}

    @Public()
    @ApiOperation({ summary: 'Get published projects by company slug' })
    @Get('companies/:slug/projects')
    findPublishedByCompanySlug(
        @Param('slug') slug: string,
        @Query('tag') tagSlug?: string,
    ) {
        return this.projectsService.findPublishedByCompanySlug(slug, tagSlug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create company project' })
    @Permissions(PERMISSIONS.COMPANY.PROJECT_MANAGE)
    @Post('companies/:companyId/projects')
    create(
        @Param('companyId') companyId: string,
        @Req() req: any,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectsService.create(companyId, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company project' })
    @Permissions(PERMISSIONS.COMPANY.PROJECT_MANAGE)
    @Patch('company-projects/:id')
    update(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete company project' })
    @Permissions(PERMISSIONS.COMPANY.PROJECT_MANAGE)
    @Delete('company-projects/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.projectsService.remove(id, req.user, req);
    }
}
