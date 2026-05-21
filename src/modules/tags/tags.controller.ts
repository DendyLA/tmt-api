import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AttachTagDto } from './dto/attach-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Public()
    @ApiOperation({ summary: 'List tags' })
    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create tag' })
    @Permissions(PERMISSIONS.TAG.CREATE)
    @Post()
    create(@Body() dto: CreateTagDto) {
        return this.tagsService.create(dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update tag' })
    @Permissions(PERMISSIONS.TAG.UPDATE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
        return this.tagsService.update(id, dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete tag' })
    @Permissions(PERMISSIONS.TAG.DELETE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tagsService.remove(id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Attach tag to entity' })
    @Permissions(PERMISSIONS.TAG.MANAGE)
    @Post('attach')
    attach(@Body() dto: AttachTagDto) {
        return this.tagsService.attach(dto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Detach tag from entity' })
    @Permissions(PERMISSIONS.TAG.MANAGE)
    @Post('detach')
    detach(@Body() dto: AttachTagDto) {
        return this.tagsService.detach(dto);
    }
}
