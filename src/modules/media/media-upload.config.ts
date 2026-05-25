import { BadRequestException } from '@nestjs/common';

export const DEFAULT_ALLOWED_MEDIA_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'application/pdf',
] as const;

export const MEDIA_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'application/pdf': '.pdf',
};

export function getAllowedMediaMimeTypes() {
    const configured = process.env.MEDIA_ALLOWED_MIME_TYPES;
    if (!configured) return [...DEFAULT_ALLOWED_MEDIA_MIME_TYPES];

    return configured
        .split(',')
        .map((mimeType) => mimeType.trim())
        .filter(Boolean);
}

export function getMediaMaxFileSize() {
    const sizeMb = Number(process.env.MEDIA_MAX_FILE_SIZE_MB ?? 20);
    const safeSizeMb = Number.isFinite(sizeMb) && sizeMb > 0 ? sizeMb : 20;
    return safeSizeMb * 1024 * 1024;
}

export function validateMediaMimeType(mimeType?: string) {
    if (!mimeType || !getAllowedMediaMimeTypes().includes(mimeType)) {
        throw new BadRequestException('Unsupported media type');
    }
}
