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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller()
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Public()
    @ApiOperation({ summary: 'Get published global + company posts by company slug' })
    @Get('companies/:slug/posts')
    findForCompanySite(@Param('slug') slug: string) {
        return this.postsService.findForCompanySite(slug);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create post' })
    @Permissions(PERMISSIONS.POST.CREATE)
    @Post('posts')
    create(@Req() req: any, @Body() dto: CreatePostDto) {
        return this.postsService.create(req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'List posts for admin' })
    @Permissions(PERMISSIONS.POST.MANAGE)
    @Get('posts')
    findAllAdmin() {
        return this.postsService.findAllAdmin();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update post' })
    @Permissions(PERMISSIONS.POST.UPDATE)
    @Patch('posts/:id')
    update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePostDto) {
        return this.postsService.update(id, req.user, dto, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish post' })
    @Permissions(PERMISSIONS.POST.PUBLISH)
    @Patch('posts/:id/publish')
    publish(@Param('id') id: string, @Req() req: any) {
        return this.postsService.publish(id, req.user, req);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete post' })
    @Permissions(PERMISSIONS.POST.DELETE)
    @Delete('posts/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.postsService.remove(id, req.user, req);
    }
}
