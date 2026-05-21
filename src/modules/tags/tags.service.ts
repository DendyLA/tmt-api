import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttachTagDto } from './dto/attach-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateTagDto) {
        await this.ensureSlugAvailable(dto.slug);
        return this.prisma.tag.create({ data: dto });
    }

    async findAll() {
        return this.prisma.tag.findMany({
            orderBy: [{ name: 'asc' }],
        });
    }

    async update(id: string, dto: UpdateTagDto) {
        const tag = await this.findTag(id);
        if (dto.slug && dto.slug !== tag.slug) {
            await this.ensureSlugAvailable(dto.slug, id);
        }

        return this.prisma.tag.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findTag(id);
        await this.prisma.tag.delete({ where: { id } });
        return { success: true };
    }

    async attach(dto: AttachTagDto) {
        await this.findTag(dto.tagId);
        await this.ensureEntityExists(dto.entityType, dto.entityId);

        if (dto.entityType === 'post') {
            return this.prisma.postTag.upsert({
                where: { postId_tagId: { postId: dto.entityId, tagId: dto.tagId } },
                update: {},
                create: { postId: dto.entityId, tagId: dto.tagId },
            });
        }

        if (dto.entityType === 'project') {
            return this.prisma.projectTag.upsert({
                where: { projectId_tagId: { projectId: dto.entityId, tagId: dto.tagId } },
                update: {},
                create: { projectId: dto.entityId, tagId: dto.tagId },
            });
        }

        return this.prisma.vacancyTag.upsert({
            where: { vacancyId_tagId: { vacancyId: dto.entityId, tagId: dto.tagId } },
            update: {},
            create: { vacancyId: dto.entityId, tagId: dto.tagId },
        });
    }

    async detach(dto: AttachTagDto) {
        if (dto.entityType === 'post') {
            await this.prisma.postTag.delete({
                where: { postId_tagId: { postId: dto.entityId, tagId: dto.tagId } },
            });
        } else if (dto.entityType === 'project') {
            await this.prisma.projectTag.delete({
                where: { projectId_tagId: { projectId: dto.entityId, tagId: dto.tagId } },
            });
        } else {
            await this.prisma.vacancyTag.delete({
                where: { vacancyId_tagId: { vacancyId: dto.entityId, tagId: dto.tagId } },
            });
        }

        return { success: true };
    }

    private async findTag(id: string) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Tag not found');
        return tag;
    }

    private async ensureSlugAvailable(slug: string, currentTagId?: string) {
        const tag = await this.prisma.tag.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (tag && tag.id !== currentTagId) {
            throw new BadRequestException('Tag slug already in use');
        }
    }

    private async ensureEntityExists(entityType: AttachTagDto['entityType'], entityId: string) {
        if (entityType === 'post') {
            const post = await this.prisma.post.findFirst({
                where: { id: entityId, deletedAt: null },
                select: { id: true },
            });
            if (!post) throw new NotFoundException('Post not found');
            return;
        }

        if (entityType === 'project') {
            const project = await this.prisma.project.findFirst({
                where: { id: entityId, deletedAt: null },
                select: { id: true },
            });
            if (!project) throw new NotFoundException('Project not found');
            return;
        }

        const vacancy = await this.prisma.vacancy.findFirst({
            where: { id: entityId, deletedAt: null },
            select: { id: true },
        });
        if (!vacancy) throw new NotFoundException('Vacancy not found');
    }
}
