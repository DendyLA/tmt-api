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
