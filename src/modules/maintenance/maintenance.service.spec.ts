import { MaintenanceService } from './maintenance.service';

describe('MaintenanceService', () => {
    let authService: { cleanupExpiredTokens: jest.Mock };
    let mediaService: { cleanupDeletedLocalFiles: jest.Mock };
    let service: MaintenanceService;

    beforeEach(() => {
        authService = {
            cleanupExpiredTokens: jest.fn(),
        };
        mediaService = {
            cleanupDeletedLocalFiles: jest.fn(),
        };
        service = new MaintenanceService(authService as any, mediaService as any);
        jest.spyOn((service as any).logger, 'log').mockImplementation(() => {});
        jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});
    });

    it('cleans expired and revoked refresh tokens', async () => {
        authService.cleanupExpiredTokens.mockResolvedValue({ deleted: 2 });

        await expect(service.cleanupExpiredRefreshTokens()).resolves.toEqual({
            deleted: 2,
        });

        expect(authService.cleanupExpiredTokens).toHaveBeenCalledTimes(1);
    });

    it('cleans deleted local media files', async () => {
        mediaService.cleanupDeletedLocalFiles.mockResolvedValue({
            scanned: 2,
            removed: 1,
            missing: 1,
        });

        await expect(service.cleanupDeletedLocalMediaFiles()).resolves.toEqual({
            scanned: 2,
            removed: 1,
            missing: 1,
        });

        expect(mediaService.cleanupDeletedLocalFiles).toHaveBeenCalledTimes(1);
    });
});
