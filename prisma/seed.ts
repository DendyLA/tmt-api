import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // =========================
    // 1. ROLES
    // =========================
    const [superadmin, admin, user] = await Promise.all([
        prisma.role.upsert({ where: { name: 'superadmin' }, update: {}, create: { name: 'superadmin' } }),
        prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin' } }),
        prisma.role.upsert({ where: { name: 'user' }, update: {}, create: { name: 'user' } }),
    ])

    // =========================
    // 2. PERMISSIONS
    // =========================
    const [
        vacancyCreate,
        vacancyUpdate,
        vacancyDelete,
        vacancyApprove,
        vacancyReject,
        vacancyArchive,
        vacancyManage,
        vacancyRestore,
        vacancyRollback,
        usersManage,
    ] = await Promise.all([
        prisma.permission.upsert({ where: { key: 'vacancy.create' }, update: {}, create: { key: 'vacancy.create' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.update' }, update: {}, create: { key: 'vacancy.update' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.delete' }, update: {}, create: { key: 'vacancy.delete' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.approve' }, update: {}, create: { key: 'vacancy.approve' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.reject' }, update: {}, create: { key: 'vacancy.reject' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.archive' }, update: {}, create: { key: 'vacancy.archive' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.manage' }, update: {}, create: { key: 'vacancy.manage' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.restore' }, update: {}, create: { key: 'vacancy.restore' } }),
        prisma.permission.upsert({ where: { key: 'vacancy.rollback' }, update: {}, create: { key: 'vacancy.rollback' } }),
        prisma.permission.upsert({ where: { key: 'users.manage' }, update: {}, create: { key: 'users.manage' } }),
    ])

    // =========================
    // 3. ROLE → PERMISSIONS
    // =========================
    await prisma.rolePermission.createMany({
        data: [
            // SUPERADMIN — всё
            { roleId: superadmin.id, permissionId: vacancyCreate.id },
            { roleId: superadmin.id, permissionId: vacancyUpdate.id },
            { roleId: superadmin.id, permissionId: vacancyDelete.id },
            { roleId: superadmin.id, permissionId: vacancyApprove.id },
            { roleId: superadmin.id, permissionId: vacancyReject.id },
            { roleId: superadmin.id, permissionId: vacancyArchive.id },
            { roleId: superadmin.id, permissionId: vacancyManage.id },
            { roleId: superadmin.id, permissionId: vacancyRestore.id },
            { roleId: superadmin.id, permissionId: vacancyRollback.id },
            { roleId: superadmin.id, permissionId: usersManage.id },
            // ADMIN — модерация
            { roleId: admin.id, permissionId: vacancyApprove.id },
            { roleId: admin.id, permissionId: vacancyReject.id },
            { roleId: admin.id, permissionId: vacancyArchive.id },
            { roleId: admin.id, permissionId: vacancyManage.id },
            // USER — создать, обновить, удалить своё
            { roleId: user.id, permissionId: vacancyCreate.id },
            { roleId: user.id, permissionId: vacancyUpdate.id },
            { roleId: user.id, permissionId: vacancyDelete.id },
        ],
        skipDuplicates: true,
    })

    // =========================
    // 4. SUPERADMIN USER
    // =========================
    const hashedPassword = await bcrypt.hash('N2UsyMo2', 10)
    await prisma.user.upsert({
        where: { email: 'd.atayev@tmt.tm' },
        update: {},
        create: {
            name: 'superadmin',
            email: 'd.atayev@tmt.tm',
            password: hashedPassword,
            roleId: superadmin.id,
        },
    })

    console.log('Seed completed successfully')
}

main()
    .then(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        await pool.end()
        process.exit(1)
    })