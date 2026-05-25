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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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
    findForCompanySite(
        @Param('slug') slug: string,
        @Query('tag') tagSlug?: string,
        @Query() query?: PaginationQueryDto,
    ) {
        return this.postsService.findForCompanySite(slug, tagSlug, query);
    }

    @Public()
    @ApiOperation({ summary: 'Get published post by company slug and post slug' })
    @Get('companies/:slug/posts/:postSlug')
    findOneForCompanySite(
        @Param('slug') slug: string,
        @Param('postSlug') postSlug: string,
        @Query() query?: PaginationQueryDto,
    ) {
        return query?.locale
            ? this.postsService.findOneForCompanySite(slug, postSlug, query.locale)
            : this.postsService.findOneForCompanySite(slug, postSlug);
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
    findAllAdmin(@Query() query: PaginationQueryDto) {
        return this.postsService.findAllAdmin(query);
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Rollback post to content version' })
    @Permissions(PERMISSIONS.CONTENT_VERSION.ROLLBACK)
    @Post('posts/:id/rollback/:versionId')
    rollback(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @Req() req: any,
    ) {
        return this.postsService.rollback(id, versionId, req.user, req);
    }
}
