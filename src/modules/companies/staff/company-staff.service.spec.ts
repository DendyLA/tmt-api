import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ROLE_NAMES } from '../../auth/constants/permissions.constants';
import { CompanyStaffService } from './company-staff.service';

describe('CompanyStaffService invites', () => {
    let prisma: any;
    let eventEmitter: { emit: jest.Mock };
    let service: CompanyStaffService;

    const actor = { sub: 'admin-1' };
    const company = { id: 'company-1', name: 'TMT', slug: 'tmt', deletedAt: null };
    const user = {
        id: 'user-1',
        name: 'Manager',
        email: 'manager@company.tm',
        isBanned: false,
    };

    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        prisma = {
            company: {
                findUnique: jest.fn().mockResolvedValue(company),
            },
            companyInvite: {
                updateMany: jest.fn().mockResolvedValue({ count: 0 }),
                create: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
            },
            companyMember: {
                upsert: jest.fn(),
            },
            role: {
                findUnique: jest.fn(),
            },
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            $transaction: jest.fn(async (callback: any) => callback(prisma)),
        };
        eventEmitter = { emit: jest.fn() };
        service = new CompanyStaffService(prisma, eventEmitter as any);
    });

    it('creates a hashed company staff invite and returns plain token once', async () => {
        prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });
        prisma.companyInvite.create.mockImplementation(({ data }: any) =>
            Promise.resolve({
                id: 'invite-1',
                ...data,
                company,
                role: { id: 'role-1', name: 'manager' },
            }),
        );

        const result = await service.createInvite(company.id, actor, {
            email: 'Manager@Company.TM',
            roleId: 'role-1',
        });

        expect(result.token).toEqual(expect.any(String));
        expect(result.invite.tokenHash).toBeUndefined();
        expect(prisma.companyInvite.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    email: 'manager@company.tm',
                    roleId: 'role-1',
                    invitedBy: actor.sub,
                    tokenHash: expect.any(String),
                }),
            }),
        );
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'company.staff.invite.created',
            expect.objectContaining({ token: result.token }),
        );
    });

    it('does not return plain invite token in production response', async () => {
        process.env.NODE_ENV = 'production';
        prisma.companyInvite.create.mockImplementation(({ data }: any) =>
            Promise.resolve({
                id: 'invite-1',
                ...data,
                company,
                role: null,
            }),
        );

        const result = await service.createInvite(company.id, actor, {
            email: 'manager@company.tm',
        });

        expect(result.token).toBeUndefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'company.staff.invite.created',
            expect.objectContaining({ token: expect.any(String) }),
        );
    });

    it('accepts invite for an existing invited user', async () => {
        const token = 'plain-token';
        const invite = {
            id: 'invite-1',
            companyId: company.id,
            email: user.email,
            roleId: 'role-1',
            isOwner: false,
            tokenHash: await bcrypt.hash(token, 10),
            company,
        };
        const member = {
            id: 'member-1',
            company,
            user,
            role: { id: 'role-1', name: 'manager' },
        };

        prisma.companyInvite.findMany.mockResolvedValue([invite]);
        prisma.user.findUnique.mockResolvedValue(user);
        prisma.companyMember.upsert.mockResolvedValue(member);

        await expect(
            service.acceptInvite(null, { token }),
        ).resolves.toEqual(member);

        expect(prisma.companyMember.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    companyId_userId: {
                        companyId: company.id,
                        userId: user.id,
                    },
                },
                create: expect.objectContaining({
                    companyId: company.id,
                    userId: user.id,
                    roleId: 'role-1',
                }),
            }),
        );
        expect(prisma.companyInvite.update).toHaveBeenCalledWith({
            where: { id: invite.id },
            data: {
                acceptedAt: expect.any(Date),
                acceptedBy: user.id,
            },
        });
    });

    it('creates a user when accepting invite for a new email', async () => {
        const token = 'plain-token';
        const invite = {
            id: 'invite-1',
            companyId: company.id,
            email: 'new@company.tm',
            roleId: null,
            isOwner: false,
            tokenHash: await bcrypt.hash(token, 10),
            company,
        };
        const createdUser = {
            id: 'user-2',
            email: invite.email,
            isBanned: false,
        };

        prisma.companyInvite.findMany.mockResolvedValue([invite]);
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.role.findUnique.mockResolvedValue({ id: 'user-role-1' });
        prisma.user.create.mockResolvedValue(createdUser);
        prisma.companyMember.upsert.mockResolvedValue({
            id: 'member-2',
            user: createdUser,
        });

        await service.acceptInvite(null, {
            token,
            name: 'New Manager',
            password: 'StrongPass123',
        });

        expect(prisma.role.findUnique).toHaveBeenCalledWith({
            where: { name: ROLE_NAMES.USER },
            select: { id: true },
        });
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: 'New Manager',
                email: invite.email,
                password: expect.any(String),
                roleId: 'user-role-1',
            }),
        });
    });

    it('rejects authenticated user with another email', async () => {
        const token = 'plain-token';
        prisma.companyInvite.findMany.mockResolvedValue([
            {
                id: 'invite-1',
                companyId: company.id,
                email: user.email,
                roleId: null,
                isOwner: false,
                tokenHash: await bcrypt.hash(token, 10),
                company,
            },
        ]);
        prisma.user.findUnique.mockResolvedValue({
            ...user,
            email: 'other@company.tm',
        });

        await expect(
            service.acceptInvite({ sub: user.id }, { token }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
