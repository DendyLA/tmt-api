import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '../auth/auth.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class MaintenanceService {
    private readonly logger = new Logger(MaintenanceService.name);

    constructor(
        private readonly authService: AuthService,
        private readonly mediaService: MediaService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupExpiredRefreshTokens() {
        try {
            const result = await this.authService.cleanupExpiredTokens();
            if (result.deleted > 0) {
                this.logger.log(
                    `Deleted ${result.deleted} expired or revoked refresh tokens`,
                );
            }

            return result;
        } catch (error) {
            this.logger.error('Failed to cleanup refresh tokens', error);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanupDeletedLocalMediaFiles() {
        try {
            const result = await this.mediaService.cleanupDeletedLocalFiles();
            if (result.scanned > 0) {
                this.logger.log(
                    `Cleaned local media files: scanned=${result.scanned}, removed=${result.removed}, missing=${result.missing}`,
                );
            }

            return result;
        } catch (error) {
            this.logger.error('Failed to cleanup deleted local media files', error);
        }
    }
}
