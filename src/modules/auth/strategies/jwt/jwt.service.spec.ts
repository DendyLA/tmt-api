import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.service';

describe('JwtStrategy', () => {
    it('maps JWT payload to authenticated user', async () => {
        const strategy = new JwtStrategy({
            get: jest.fn().mockReturnValue('test-secret'),
        } as unknown as ConfigService);

        await expect(
            strategy.validate({
                sub: 'user-1',
                email: 'user@example.com',
                role: 'admin',
                permissions: ['post.manage'],
            }),
        ).resolves.toEqual({
            sub: 'user-1',
            email: 'user@example.com',
            role: 'admin',
            permissions: ['post.manage'],
        });
    });

    it('defaults missing role and permissions', async () => {
        const strategy = new JwtStrategy({
            get: jest.fn().mockReturnValue('test-secret'),
        } as unknown as ConfigService);

        await expect(
            strategy.validate({
                sub: 'user-1',
                email: 'user@example.com',
            }),
        ).resolves.toEqual({
            sub: 'user-1',
            email: 'user@example.com',
            role: null,
            permissions: [],
        });
    });
});
