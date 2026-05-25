import { UsersController } from './users.controller';

describe('UsersController', () => {
    let usersService: any;
    let controller: UsersController;

    beforeEach(() => {
        usersService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            getMe: jest.fn(),
        };
        controller = new UsersController(usersService);
    });

    it('delegates user endpoints to service', async () => {
        const user = { id: 'user-1', email: 'user@example.com' };
        usersService.create.mockResolvedValue(user);
        usersService.findAll.mockResolvedValue([user]);
        usersService.findOne.mockResolvedValue(user);
        usersService.getMe.mockResolvedValue(user);

        await expect(
            controller.create({
                name: 'User',
                email: user.email,
                password: 'password',
            }),
        ).resolves.toEqual(user);
        await expect(controller.findAll()).resolves.toEqual([user]);
        await expect(controller.findOne(user.id)).resolves.toEqual(user);
        await expect(
            controller.getMe({ user: { userId: user.id } }),
        ).resolves.toEqual(user);
    });
});
