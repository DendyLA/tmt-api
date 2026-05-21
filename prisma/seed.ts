import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import {
    ALL_PERMISSIONS,
    PERMISSIONS,
} from '../src/modules/auth/constants/permissions.constants'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
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

    const permissionRecords = await Promise.all(
        ALL_PERMISSIONS.map((key) =>
            prisma.permission.upsert({
                where: { key },
                update: {},
                create: { key },
            }),
        ),
    )

    const permissionByKey = Object.fromEntries(
        permissionRecords.map((permission) => [permission.key, permission]),
    )

    await prisma.rolePermission.createMany({
        data: [
            ...ALL_PERMISSIONS.map((key) => ({
                roleId: superadmin.id,
                permissionId: permissionByKey[key].id,
            })),
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.VACANCY.APPROVE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.REJECT].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.ARCHIVE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.COMPANY.CREATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.COMPANY.UPDATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.COMPANY.DELETE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.CONTACT_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.SOCIAL_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.PROJECT_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.SERVICE_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.PARTNER_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.STAFF_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.COMPANY.SITE_SETTINGS_MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.COMPANY.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.POST.CREATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.POST.UPDATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.POST.DELETE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.POST.PUBLISH].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.POST.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.MEDIA.CREATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.MEDIA.UPDATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.MEDIA.DELETE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.MEDIA.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.TAG.CREATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.TAG.UPDATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.TAG.DELETE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.TAG.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.CONTENT_VERSION.READ].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.CONTENT_VERSION.ROLLBACK].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.AD.CREATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.AD.UPDATE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.AD.DELETE].id,
            },
            {
                roleId: admin.id,
                permissionId: permissionByKey[PERMISSIONS.AD.MANAGE].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.ADMIN.DASHBOARD_READ].id,
            },
            {
                roleId: admin.id,
                permissionId:
                    permissionByKey[PERMISSIONS.ADMIN.MODERATION_READ].id,
            },
            {
                roleId: user.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.CREATE].id,
            },
            {
                roleId: user.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.UPDATE].id,
            },
            {
                roleId: user.id,
                permissionId: permissionByKey[PERMISSIONS.VACANCY.DELETE].id,
            },
        ],
        skipDuplicates: true,
    })

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
