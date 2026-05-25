import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

describe('App smoke e2e', () => {
    let app: INestApplication;
    let prisma: any;

    let user: any;

    beforeEach(async () => {
        user = {
            id: 'user-1',
            email: 'user@example.com',
            password: await bcrypt.hash('password', 10),
            isBanned: false,
            role: {
                name: 'admin',
                permissions: [
                    { permission: { key: 'post.create' } },
                    { permission: { key: 'post.manage' } },
                    { permission: { key: 'admin.dashboard.read' } },
                ],
            },
        };
        prisma = createPrismaMock(user);

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prisma)
            .compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('returns health payload', async () => {
        await request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect(({ body }) => {
                expect(body.status).toBe('ok');
                expect(body.timestamp).toEqual(expect.any(String));
            });
    });

    it('logs in, refreshes, and logs out', async () => {
        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: user.email, password: 'password' })
            .expect(201);

        expect(login.body.access_token).toEqual(expect.any(String));
        expect(login.body.refresh_token).toEqual(expect.any(String));

        prisma.refreshToken.findMany.mockResolvedValueOnce([
            {
                id: 'refresh-1',
                tokenHash: await bcrypt.hash(login.body.refresh_token, 10),
                user,
            },
        ]);

        const refreshed = await request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken: login.body.refresh_token })
            .expect(201);

        expect(refreshed.body.access_token).toEqual(expect.any(String));

        prisma.refreshToken.findMany.mockResolvedValueOnce([
            {
                id: 'session-1',
                ipAddress: '127.0.0.1',
                userAgent: 'jest',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 1000),
            },
        ]);

        await request(app.getHttpServer())
            .get('/auth/sessions')
            .set('Authorization', `Bearer ${refreshed.body.access_token}`)
            .expect(200)
            .expect(({ body }) => {
                expect(body[0].id).toBe('session-1');
            });

        prisma.refreshToken.findMany.mockResolvedValueOnce([
            {
                id: 'refresh-2',
                tokenHash: await bcrypt.hash(refreshed.body.refresh_token, 10),
            },
        ]);

        await request(app.getHttpServer())
            .post('/auth/logout')
            .send({ refreshToken: refreshed.body.refresh_token })
            .expect(201)
            .expect({ success: true });

        await request(app.getHttpServer())
            .post('/auth/logout-all')
            .set('Authorization', `Bearer ${refreshed.body.access_token}`)
            .expect(201)
            .expect({ success: true });
    });

    it('reads public localized posts', async () => {
        await request(app.getHttpServer())
            .get('/companies/tmt/posts?locale=RU&page=1&limit=10')
            .expect(200)
            .expect(({ body }) => {
                expect(body.data[0].translation.title).toBe('Новость');
                expect(body.meta.total).toBe(1);
            });
    });

    it('reads admin dashboard with bearer token', async () => {
        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: user.email, password: 'password' })
            .expect(201);

        await request(app.getHttpServer())
            .get('/admin/dashboard')
            .set('Authorization', `Bearer ${login.body.access_token}`)
            .expect(200)
            .expect(({ body }) => {
                expect(body.totals.users).toBe(1);
            });
    });
});

function createPrismaMock(user: any) {
    const company = { id: 'company-1', slug: 'tmt', deletedAt: null };
    const post = {
        id: 'post-1',
        slug: 'news',
        title: 'Новость',
        excerpt: null,
        content: 'Текст новости',
        translations: [
            {
                locale: 'RU',
                title: 'Новость',
                excerpt: null,
                content: 'Текст новости',
            },
        ],
        tags: [],
    };

    return {
        $connect: jest.fn(),
        user: {
            count: jest.fn().mockResolvedValue(1),
            findUnique: jest.fn().mockResolvedValue(user),
        },
        role: {
            findUnique: jest.fn(),
        },
        refreshToken: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        company: {
            count: jest.fn().mockResolvedValue(1),
            findFirst: jest.fn().mockResolvedValue(company),
        },
        post: {
            count: jest.fn().mockResolvedValue(1),
            findMany: jest.fn().mockResolvedValue([post]),
        },
        vacancy: {
            count: jest.fn().mockResolvedValue(0),
        },
        media: {
            count: jest.fn().mockResolvedValue(0),
        },
        ad: {
            count: jest.fn().mockResolvedValue(0),
        },
        activityLog: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0),
        },
    };
}
