import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-value'),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let prisma: any;
    let jwt: any;
    let eventEmitter: { emit: jest.Mock };
    let service: AuthService;

    const role = {
        id: 'role-1',
        name: 'user',
        permissions: [
            {
                permission: { key: 'vacancy.create' },
            },
        ],
    };

    const user = {
        id: 'user-1',
        name: 'User',
        email: 'user@example.com',
        password: 'hashed-password',
        isBanned: false,
        role,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        prisma = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            role: {
                findUnique: jest.fn(),
            },
            refreshToken: {
                create: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
                updateMany: jest.fn(),
                deleteMany: jest.fn(),
            },
            emailVerificationToken: {
                create: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
                updateMany: jest.fn(),
            },
            $transaction: jest.fn().mockResolvedValue([]),
        };

        jwt = {
            sign: jest.fn().mockReturnValue('access-token'),
        };
        eventEmitter = { emit: jest.fn() };

        service = new AuthService(prisma, jwt, eventEmitter as any);
    });

    it('registers user and issues access plus refresh tokens', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.role.findUnique.mockResolvedValue(role);
        prisma.user.create.mockResolvedValue(user);
        prisma.refreshToken.create.mockResolvedValue({});

        await expect(
            service.register({
                name: 'User',
                email: user.email,
                password: 'password',
            }),
        ).resolves.toEqual({
            access_token: 'access-token',
            refresh_token: expect.any(String),
            emailVerified: false,
        });

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                name: 'User',
                email: user.email,
                password: expect.any(String),
                roleId: role.id,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        expect(prisma.refreshToken.create).toHaveBeenCalled();
        expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'auth.emailVerification.created',
            expect.objectContaining({
                user,
                token: expect.any(String),
            }),
        );
    });

    it('rejects register when email is already used', async () => {
        prisma.user.findUnique.mockResolvedValue(user);

        await expect(
            service.register({
                name: 'User',
                email: user.email,
                password: 'password',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('logs in with valid credentials', async () => {
        prisma.user.findUnique.mockResolvedValue(user);
        prisma.refreshToken.create.mockResolvedValue({});
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

        await expect(
            service.login({
                email: user.email,
                password: 'password',
            }),
        ).resolves.toEqual({
            access_token: 'access-token',
            refresh_token: expect.any(String),
            emailVerified: false,
        });
    });

    it('rejects invalid login credentials', async () => {
        prisma.user.findUnique.mockResolvedValue(user);
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

        await expect(
            service.login({
                email: user.email,
                password: 'wrong',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rotates refresh token', async () => {
        prisma.refreshToken.findMany.mockResolvedValue([
            {
                id: 'token-1',
                tokenHash: 'hashed-refresh',
                user,
            },
        ]);
        prisma.refreshToken.update.mockResolvedValue({});
        prisma.refreshToken.create.mockResolvedValue({});
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(true);

        await expect(service.refresh('refresh-token')).resolves.toEqual({
            access_token: 'access-token',
            refresh_token: expect.any(String),
            emailVerified: false,
        });

        expect(prisma.refreshToken.update).toHaveBeenCalledWith({
            where: { id: 'token-1' },
            data: { revokedAt: expect.any(Date) },
        });
    });

    it('logs out by revoking matching refresh token', async () => {
        prisma.refreshToken.findMany.mockResolvedValue([
            { id: 'token-1', tokenHash: 'hashed-refresh' },
        ]);
        prisma.refreshToken.update.mockResolvedValue({});
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

        await expect(service.logout('refresh-token')).resolves.toEqual({
            success: true,
        });
        expect(prisma.refreshToken.update).toHaveBeenCalledWith({
            where: { id: 'token-1' },
            data: { revokedAt: expect.any(Date) },
        });
    });

    it('lists active sessions and revokes all sessions', async () => {
        const sessions = [{ id: 'token-1', ipAddress: '127.0.0.1' }];
        prisma.refreshToken.findMany.mockResolvedValue(sessions);
        prisma.refreshToken.updateMany.mockResolvedValue({ count: 2 });

        await expect(service.getSessions(user.id)).resolves.toEqual(sessions);
        await expect(service.logoutAll(user.id)).resolves.toEqual({
            success: true,
        });

        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
            where: {
                userId: user.id,
                revokedAt: null,
            },
            data: { revokedAt: expect.any(Date) },
        });
    });

    it('cleans up expired or revoked refresh tokens', async () => {
        prisma.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

        await expect(service.cleanupExpiredTokens()).resolves.toEqual({
            deleted: 3,
        });
    });

    it('verifies email with active token', async () => {
        prisma.emailVerificationToken.findMany.mockResolvedValue([
            {
                id: 'email-token-1',
                userId: user.id,
                tokenHash: 'hashed-token',
                user: { ...user, emailVerifiedAt: null },
            },
        ]);
        prisma.user.update.mockReturnValue({ operation: 'user.update' });
        prisma.emailVerificationToken.update.mockReturnValue({
            operation: 'emailVerificationToken.update',
        });
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

        await expect(service.verifyEmail('token')).resolves.toEqual({
            success: true,
        });

        expect(prisma.$transaction).toHaveBeenCalledWith([
            { operation: 'user.update' },
            { operation: 'emailVerificationToken.update' },
        ]);
    });
});
