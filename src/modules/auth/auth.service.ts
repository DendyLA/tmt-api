import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type UserWithRolePermissions = {
    id: string;
    email: string;
    role: {
        name: string;
        permissions: {
            permission: {
                key: string;
            };
        }[];
    } | null;
};

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (exists) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const userRole = await this.prisma.role.findUnique({
            where: { name: 'user' },
        });

        if (!userRole) {
            throw new BadRequestException('Default role not found');
        }

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                roleId: userRole.id,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        return this.signToken(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');
        const isValid = await bcrypt.compare(dto.password, user.password);
        if (!isValid) throw new UnauthorizedException('Invalid credentials');
        if (user.isBanned) throw new UnauthorizedException('Account is banned');

        return this.signToken(user);
    }

    private signToken(user: UserWithRolePermissions) {
        const permissions =
            user.role?.permissions.map((item) => item.permission.key) ?? [];

        return {
            access_token: this.jwt.sign({
                sub: user.id,
                email: user.email,
                role: user.role?.name ?? null,
                permissions,
            }),
        };
    }
}
