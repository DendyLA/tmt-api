import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ContentVersionsService } from './content-versions.service';

@ApiTags('Content Versions')
@ApiBearerAuth()
@Controller('content-versions')
export class ContentVersionsController {
    constructor(private readonly versionsService: ContentVersionsService) {}

    @ApiOperation({ summary: 'List content versions by entity' })
    @Permissions(PERMISSIONS.CONTENT_VERSION.READ)
    @Get(':entityType/:entityId')
    findByEntity(
        @Param('entityType') entityType: string,
        @Param('entityId') entityId: string,
    ) {
        return this.versionsService.findByEntity(entityType, entityId);
    }
}
