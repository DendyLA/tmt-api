import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const describeIfDb = process.env.TEST_DATABASE_URL ? describe : describe.skip;

describeIfDb('App real database e2e', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
        process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

        prisma = new PrismaClient({
            adapter: new PrismaPg({
                connectionString: process.env.TEST_DATABASE_URL,
            }),
        });

        await prisma.$connect();
        await cleanup();
        await seedRbac();

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

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

    afterAll(async () => {
        await app?.close();
        await cleanup();
        await prisma?.$disconnect();
    });

    it('registers, refreshes, creates localized post, and reads it publicly', async () => {
        const register = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'E2E Admin',
                email: 'e2e-admin@example.com',
                password: 'StrongPass123',
            })
            .expect(201);

        const refresh = await request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken: register.body.refresh_token })
            .expect(201);

        const company = await prisma.company.create({
            data: {
                name: 'E2E Company',
                slug: 'e2e-company',
                translations: {
                    create: {
                        locale: 'RU',
                        name: 'E2E Компания',
                        description: 'Описание компании',
                    },
                },
            },
        });

        await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${refresh.body.access_token}`)
            .send({
                companyId: company.id,
                slug: 'e2e-post',
                title: 'Fallback title',
                content: 'Fallback content for legacy field',
                status: 'PUBLISHED',
                translations: [
                    {
                        locale: 'RU',
                        title: 'Русская новость',
                        content: 'Русский текст новости',
                    },
                    {
                        locale: 'EN',
                        title: 'English news',
                        content: 'English post content',
                    },
                ],
            })
            .expect(201);

        await request(app.getHttpServer())
            .get('/companies/e2e-company/posts/e2e-post?locale=EN')
            .expect(200)
            .expect(({ body }) => {
                expect(body.translation.title).toBe('English news');
            });
    });

    it('creates and accepts a company staff invite', async () => {
        const owner = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'E2E Owner',
                email: 'e2e-owner@example.com',
                password: 'StrongPass123',
            })
            .expect(201);

        const company = await request(app.getHttpServer())
            .post('/companies')
            .set('Authorization', `Bearer ${owner.body.access_token}`)
            .send({
                name: 'Invite Company',
                slug: 'invite-company',
            })
            .expect(201);

        const invite = await request(app.getHttpServer())
            .post(`/companies/${company.body.id}/staff/invite`)
            .set('Authorization', `Bearer ${owner.body.access_token}`)
            .send({
                email: 'new-staff@example.com',
            })
            .expect(201);

        expect(invite.body.token).toEqual(expect.any(String));

        await request(app.getHttpServer())
            .get(`/companies/staff/invites/${invite.body.token}`)
            .expect(200)
            .expect(({ body }) => {
                expect(body.email).toBe('new-staff@example.com');
                expect(body.tokenHash).toBeUndefined();
                expect(body.company.slug).toBe('invite-company');
            });

        await request(app.getHttpServer())
            .post('/companies/staff/invites/accept')
            .send({
                token: invite.body.token,
                name: 'New Staff',
                password: 'StrongPass123',
            })
            .expect(201)
            .expect(({ body }) => {
                expect(body.company.slug).toBe('invite-company');
                expect(body.user.email).toBe('new-staff@example.com');
            });
    });

    async function seedRbac() {
        const role = await prisma.role.upsert({
            where: { name: 'user' },
            update: {},
            create: { name: 'user' },
        });

        const permissions = [
            'vacancy.create',
            'vacancy.update',
            'vacancy.delete',
            'post.create',
            'post.manage',
            'company.create',
            'company.staff.manage',
            'admin.dashboard.read',
        ];

        for (const key of permissions) {
            const permission = await prisma.permission.upsert({
                where: { key },
                update: {},
                create: { key },
            });
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    async function cleanup() {
        if (!prisma) return;

        await prisma.activityLog.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.emailVerificationToken.deleteMany();
        await prisma.companyInvite.deleteMany();
        await prisma.postTranslation.deleteMany();
        await prisma.post.deleteMany();
        await prisma.companyTranslation.deleteMany();
        await prisma.companyMember.deleteMany();
        await prisma.company.deleteMany();
        await prisma.user.deleteMany();
        await prisma.rolePermission.deleteMany();
        await prisma.permission.deleteMany();
        await prisma.role.deleteMany();
    }
});
