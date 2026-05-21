import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AdminService } from './admin.service';

@ApiBearerAuth()
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @ApiOperation({ summary: 'Get admin dashboard summary' })
    @Permissions(PERMISSIONS.ADMIN.DASHBOARD_READ)
    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @ApiOperation({ summary: 'Get moderation queues for admin panel' })
    @Permissions(PERMISSIONS.ADMIN.MODERATION_READ)
    @Get('moderation/queues')
    getModerationQueues(@Query() query: PaginationQueryDto) {
        return this.adminService.getModerationQueues(query);
    }
}
