import { AuthController } from './auth.controller';

describe('AuthController', () => {
    let authService: any;
    let controller: AuthController;

    beforeEach(() => {
        authService = {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
        };

        controller = new AuthController(authService);
    });

    it('delegates register/login/refresh/logout to service', async () => {
        const tokens = {
            access_token: 'access',
            refresh_token: 'refresh',
        };

        authService.register.mockResolvedValue(tokens);
        authService.login.mockResolvedValue(tokens);
        authService.refresh.mockResolvedValue(tokens);
        authService.logout.mockResolvedValue({ success: true });

        await expect(
            controller.register({
                name: 'User',
                email: 'user@example.com',
                password: 'password',
            }),
        ).resolves.toEqual(tokens);
        await expect(
            controller.login({
                email: 'user@example.com',
                password: 'password',
            }),
        ).resolves.toEqual(tokens);
        await expect(
            controller.refresh({ refreshToken: 'refresh' }),
        ).resolves.toEqual(tokens);
        await expect(
            controller.logout({ refreshToken: 'refresh' }),
        ).resolves.toEqual({ success: true });
    });
});
