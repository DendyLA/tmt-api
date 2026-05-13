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
        prisma.role.upsert({
            where: { name: 'superadmin' },
            update: {},
            create: { name: 'superadmin' },
        }),
        prisma.role.upsert({
            where: { name: 'admin' },
            update: {},
            create: { name: 'admin' },
        }),
        prisma.role.upsert({
            where: { name: 'user' },
            update: {},
            create: { name: 'user' },
        }),
    ])

    // =========================
    // 2. PERMISSIONS
    // =========================
    const [vacancyCreate, vacancyApprove, vacancyManage, usersManage] = await Promise.all([
        prisma.permission.upsert({
            where: { key: 'vacancy.create' },
            update: {},
            create: { key: 'vacancy.create' },
        }),
        prisma.permission.upsert({
            where: { key: 'vacancy.approve' },
            update: {},
            create: { key: 'vacancy.approve' },
        }),
        prisma.permission.upsert({
            where: { key: 'vacancy.manage' },
            update: {},
            create: { key: 'vacancy.manage' },
        }),
        prisma.permission.upsert({
            where: { key: 'users.manage' },
            update: {},
            create: { key: 'users.manage' },
        }),
    ])

    // =========================
    // 3. ROLE → PERMISSIONS
    // =========================

    await prisma.rolePermission.createMany({
        data: [
            // SUPERADMIN (full access)
            { roleId: superadmin.id, permissionId: vacancyCreate.id },
            { roleId: superadmin.id, permissionId: vacancyApprove.id },
            { roleId: superadmin.id, permissionId: vacancyManage.id },
            { roleId: superadmin.id, permissionId: usersManage.id },

            // ADMIN (moderation only)
            { roleId: admin.id, permissionId: vacancyApprove.id },
            { roleId: admin.id, permissionId: vacancyManage.id },

            // USER (create only)
            { roleId: user.id, permissionId: vacancyCreate.id },
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
            name: 'admin',
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