# TMT Backend

Production-oriented NestJS backend for a multi-company content platform.

## Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT auth with refresh token sessions
- Permission-based RBAC
- EventEmitter side effects
- Audit logs
- Soft delete
- Content versioning
- Local media uploads

## Environment

Create `.env` from `.env.example`.

Required:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tmt
JWT_SECRET=replace-with-at-least-32-random-characters
```

Useful production flags:

```bash
NODE_ENV=production
ENABLE_SWAGGER=false
TRUST_PROXY=true
CORS_ORIGINS=https://example.com
REQUEST_BODY_LIMIT=1mb
MEDIA_MAX_FILE_SIZE_MB=20
MEDIA_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf
APP_URL=https://example.com
```

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

Docker helpers:

```bash
npm run docker:start
npm run docker:stop
```

## Database

Apply migrations:

```bash
npm run prisma:migrate:deploy
```

Seed roles, permissions, and superadmin:

```bash
npm run prisma:seed
```

The seed uses the RBAC matrix from `src/modules/auth/constants/permissions.constants.ts`.

## Tests

```bash
npm run test
npm run test:e2e
```

Real database e2e is opt-in:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tmt_test npm run test:e2e:db
```

## Main Admin Endpoints

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id/ban`
- `PATCH /admin/users/:id/unban`
- `GET /admin/permissions`
- `GET /admin/roles`
- `PUT /admin/roles/:id/permissions`

## Company Staff Invites

- `POST /companies/:companyId/staff/invite`
- `GET /companies/staff/invites/:token`
- `POST /companies/staff/invites/accept`
- `DELETE /companies/:companyId/staff/invites/:id`

In production, the plain invite token is not returned in the API response. It is emitted through `company.staff.invite.created` for an email provider listener.

## Deployment Checklist

1. Set production `.env`.
2. Run `npm ci`.
3. Run `npm run prisma:generate`.
4. Run `npm run prisma:migrate:deploy`.
5. Run `npm run prisma:seed`.
6. Run `npm run build`.
7. Start with `npm run start:prod`.
8. Check `/health`.
