import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import {
    ALL_PERMISSIONS,
    PERMISSION_DEFINITIONS,
    ROLE_NAMES,
    ROLE_PERMISSION_MATRIX,
} from '../src/modules/auth/constants/permissions.constants'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const roles = await Promise.all(
        Object.keys(ROLE_PERMISSION_MATRIX).map((name) =>
            prisma.role.upsert({
                where: { name },
                update: {},
                create: { name },
            }),
        ),
    )

    const permissionRecords = await Promise.all(
        ALL_PERMISSIONS.map((key) => {
            const definition = PERMISSION_DEFINITIONS[key]

            return prisma.permission.upsert({
                where: { key },
                update: { description: definition.description },
                create: { key, description: definition.description },
            })
        }),
    )

    const permissionByKey = Object.fromEntries(
        permissionRecords.map((permission) => [permission.key, permission]),
    )

    const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]))

    await prisma.rolePermission.deleteMany({
        where: { roleId: { in: roles.map((role) => role.id) } },
    })

    await prisma.rolePermission.createMany({
        data: Object.entries(ROLE_PERMISSION_MATRIX).flatMap(
            ([roleName, permissionKeys]) =>
                permissionKeys.map((key) => ({
                    roleId: roleByName[roleName].id,
                    permissionId: permissionByKey[key].id,
                })),
        ),
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
            roleId: roleByName[ROLE_NAMES.SUPERADMIN].id,
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
