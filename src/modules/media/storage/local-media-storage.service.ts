import { BadRequestException, Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

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

        const extension = this.resolveExtension(file);
        const filename = `${randomUUID()}${extension}`;
        const absolutePath = join(this.uploadRoot, filename);

        await mkdir(this.uploadRoot, { recursive: true });
        await writeFile(absolutePath, file.buffer);

        return {
            url: `/uploads/media/${filename}`,
            type: this.resolveMediaType(file.mimetype),
            filename,
            size: file.size ?? file.buffer.length,
            mimeType: file.mimetype,
        };
    }

    private resolveExtension(file: UploadedFile) {
        const fromName = extname(file.originalname ?? '').toLowerCase();
        if (fromName && /^[a-z0-9.]+$/.test(fromName)) return fromName;

        if (file.mimetype === 'image/jpeg') return '.jpg';
        if (file.mimetype === 'image/png') return '.png';
        if (file.mimetype === 'image/webp') return '.webp';
        if (file.mimetype === 'image/gif') return '.gif';
        if (file.mimetype === 'application/pdf') return '.pdf';
        if (file.mimetype === 'video/mp4') return '.mp4';

        return '.bin';
    }

    private resolveMediaType(mimeType?: string) {
        if (!mimeType) return MediaType.OTHER;
        if (mimeType.startsWith('image/')) return MediaType.IMAGE;
        if (mimeType.startsWith('video/')) return MediaType.VIDEO;
        if (mimeType === 'application/pdf') return MediaType.DOCUMENT;
        return MediaType.OTHER;
    }
}
