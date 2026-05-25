import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
    let prisma: any;
    let service: UsersService;

    beforeEach(() => {
        prisma = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
            },
            role: {
                findUnique: jest.fn(),
            },
        };

        service = new UsersService(prisma);
    });

    it('creates user with default role', async () => {
        const role = { id: 'role-1', name: 'user' };
        const user = { id: 'user-1', email: 'user@example.com' };
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.role.findUnique.mockResolvedValue(role);
        prisma.user.create.mockResolvedValue(user);

        await expect(
            service.create({
                name: 'User',
                email: user.email,
                password: 'password',
            }),
        ).resolves.toEqual(user);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                name: 'User',
                email: user.email,
                password: 'hashed-password',
                roleId: role.id,
            },
        });
    });

    it('rejects duplicate email', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

        await expect(
            service.create({
                name: 'User',
                email: 'user@example.com',
                password: 'password',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
