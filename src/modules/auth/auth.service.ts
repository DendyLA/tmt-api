import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';

type UserWithRolePermissions = {
    id: string;
    email: string;
    emailVerifiedAt?: Date | null;
    role: {
        name: string;
        permissions: {
            permission: {
                key: string;
            };
        }[];
    } | null;
};

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private eventEmitter: EventEmitter2,
    ) {}

    async register(dto: RegisterDto, req?: any) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (exists) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const userRole = await this.prisma.role.findUnique({
            where: { name: 'user' },
        });

        if (!userRole) {
            throw new BadRequestException('Default role not found');
        }

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                roleId: userRole.id,
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

        await this.createEmailVerification(user, req);

        return this.issueTokens(user, req);
    }

    async login(dto: LoginDto, req?: any) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
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

        if (!user) throw new UnauthorizedException('Invalid credentials');
        const isValid = await bcrypt.compare(dto.password, user.password);
        if (!isValid) throw new UnauthorizedException('Invalid credentials');
        if (user.isBanned) throw new UnauthorizedException('Account is banned');

        return this.issueTokens(user, req);
    }

    async verifyEmail(token: string) {
        const activeTokens = await this.prisma.emailVerificationToken.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        const tokenRecord = await this.findMatchingRefreshToken(
            token,
            activeTokens,
        );

        if (!tokenRecord) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: tokenRecord.userId },
                data: { emailVerifiedAt: tokenRecord.user.emailVerifiedAt ?? new Date() },
            }),
            this.prisma.emailVerificationToken.update({
                where: { id: tokenRecord.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return { success: true };
    }

    async resendEmailVerification(userId: string, req?: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, emailVerifiedAt: true },
        });

        if (!user) throw new UnauthorizedException();
        if (user.emailVerifiedAt) return { success: true, alreadyVerified: true };

        await this.createEmailVerification(user, req);
        return { success: true };
    }

    async refresh(refreshToken: string, req?: any) {
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        const tokenRecord = await this.findMatchingRefreshToken(
            refreshToken,
            activeTokens,
        );

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const isValid = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
        if (!isValid || tokenRecord.user.isBanned) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });

        return this.issueTokens(tokenRecord.user, req);
    }

    async logout(refreshToken: string) {
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        for (const token of activeTokens) {
            if (await bcrypt.compare(refreshToken, token.tokenHash)) {
                await this.prisma.refreshToken.update({
                    where: { id: token.id },
                    data: { revokedAt: new Date() },
                });
                break;
            }
        }

        return { success: true };
    }

    async getSessions(userId: string) {
        return this.prisma.refreshToken.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
                expiresAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async revokeSession(userId: string, sessionId: string) {
        await this.prisma.refreshToken.updateMany({
            where: {
                id: sessionId,
                userId,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        return { success: true };
    }

    async logoutAll(userId: string) {
        await this.prisma.refreshToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        return { success: true };
    }

    async cleanupExpiredTokens() {
        const result = await this.prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revokedAt: { not: null } },
                ],
            },
        });

        return { deleted: result.count };
    }

    private async issueTokens(user: UserWithRolePermissions, req?: any) {
        const refreshToken = randomBytes(48).toString('hex');
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: this.getRefreshTokenExpiry(),
                ipAddress: req?.ip,
                userAgent: req?.headers?.['user-agent'],
            },
        });

        return {
            access_token: this.signAccessToken(user),
            refresh_token: refreshToken,
            emailVerified: Boolean(user.emailVerifiedAt),
        };
    }

    private signAccessToken(user: UserWithRolePermissions) {
        const permissions =
            user.role?.permissions.map((item) => item.permission.key) ?? [];

        return this.jwt.sign({
            sub: user.id,
            email: user.email,
            emailVerified: Boolean(user.emailVerifiedAt),
            role: user.role?.name ?? null,
            permissions,
        });
    }

    private async createEmailVerification(
        user: { id: string; email: string },
        req?: any,
    ) {
        await this.prisma.emailVerificationToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { usedAt: new Date() },
        });

        const token = randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(token, 10);

        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: this.getEmailVerificationExpiry(),
            },
        });

        this.eventEmitter.emit('auth.emailVerification.created', {
            user,
            token,
            req,
        });
    }

    private getRefreshTokenExpiry() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        return expiresAt;
    }

    private getEmailVerificationExpiry() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);
        return expiresAt;
    }

    private async findMatchingRefreshToken<T extends { tokenHash: string }>(
        refreshToken: string,
        tokens: T[],
    ) {
        for (const token of tokens) {
            if (await bcrypt.compare(refreshToken, token.tokenHash)) {
                return token;
            }
        }

        return null;
    }
}
