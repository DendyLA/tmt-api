import { Body, Controller, Get, Param, Patch, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AdminService } from './admin.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

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

    @ApiOperation({ summary: 'Search activity logs for admin panel' })
    @Permissions(PERMISSIONS.ADMIN.DASHBOARD_READ)
    @Get('activity-logs')
    getActivityLogs(@Query() query: ActivityLogsQueryDto) {
        return this.adminService.getActivityLogs(query);
    }

    @ApiOperation({ summary: 'List users for admin panel' })
    @Permissions(PERMISSIONS.USERS.MANAGE)
    @Get('users')
    getUsers(@Query() query: AdminUsersQueryDto) {
        return this.adminService.getUsers(query);
    }

    @ApiOperation({ summary: 'Get user details for admin panel' })
    @Permissions(PERMISSIONS.USERS.MANAGE)
    @Get('users/:id')
    getUser(@Param('id') id: string) {
        return this.adminService.getUser(id);
    }

    @ApiOperation({ summary: 'Ban user' })
    @Permissions(PERMISSIONS.USERS.MANAGE)
    @Patch('users/:id/ban')
    banUser(@Param('id') id: string, @Req() req: any) {
        return this.adminService.banUser(id, req.user, req);
    }

    @ApiOperation({ summary: 'Unban user' })
    @Permissions(PERMISSIONS.USERS.MANAGE)
    @Patch('users/:id/unban')
    unbanUser(@Param('id') id: string, @Req() req: any) {
        return this.adminService.unbanUser(id, req.user, req);
    }

    @ApiOperation({ summary: 'List available permissions for admin panel' })
    @Permissions(PERMISSIONS.ADMIN.DASHBOARD_READ)
    @Get('permissions')
    getPermissions() {
        return this.adminService.getPermissions();
    }

    @ApiOperation({ summary: 'List roles with assigned permissions' })
    @Permissions(PERMISSIONS.ADMIN.DASHBOARD_READ)
    @Get('roles')
    getRoles() {
        return this.adminService.getRoles();
    }

    @ApiOperation({ summary: 'Replace permissions assigned to a role' })
    @Permissions(PERMISSIONS.ADMIN.RBAC_MANAGE)
    @Put('roles/:id/permissions')
    updateRolePermissions(
        @Param('id') id: string,
        @Body() dto: UpdateRolePermissionsDto,
    ) {
        return this.adminService.updateRolePermissions(id, dto);
    }
}
