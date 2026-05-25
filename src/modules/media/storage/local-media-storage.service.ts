import { BadRequestException, Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import {
    MEDIA_EXTENSION_BY_MIME_TYPE,
    validateMediaMimeType,
} from '../media-upload.config';

type UploadedFile = {
    buffer?: Buffer;
    originalname?: string;
    mimetype?: string;
    size?: number;
};

@Injectable()
export class LocalMediaStorageService {
    private readonly uploadRoot = join(
        process.cwd(),
        'public',
        'uploads',
        'media',
    );

    async save(file: UploadedFile) {
        if (!file?.buffer) {
            throw new BadRequestException('Media file is required');
        }
        validateMediaMimeType(file.mimetype);

        const extension = this.resolveExtension(file);
        const filename = `${randomUUID()}${extension}`;
        const absolutePath = join(this.uploadRoot, filename);

        await mkdir(this.uploadRoot, { recursive: true });
        await writeFile(absolutePath, file.buffer);

        return {
            url: `/uploads/media/${filename}`,
            type: this.resolveMediaType(file.mimetype),
            fileName: filename,
            originalName: file.originalname,
            size: file.size ?? file.buffer.length,
            mimeType: file.mimetype,
            storage: 'local',
        };
    }

    async remove(fileName: string) {
        try {
            await unlink(join(this.uploadRoot, fileName));
            return true;
        } catch (error: any) {
            if (error?.code === 'ENOENT') return false;
            throw error;
        }
    }

    private resolveExtension(file: UploadedFile) {
        return MEDIA_EXTENSION_BY_MIME_TYPE[file.mimetype ?? ''] ?? '.bin';
    }

    private resolveMediaType(mimeType?: string) {
        if (!mimeType) return MediaType.OTHER;
        if (mimeType.startsWith('image/')) return MediaType.IMAGE;
        if (mimeType.startsWith('video/')) return MediaType.VIDEO;
        if (mimeType === 'application/pdf') return MediaType.DOCUMENT;
        return MediaType.OTHER;
    }
}
