import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma/prisma.service';

@Injectable()
export class VacancyOwnershipGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const id = req.params.id;

        if (!user) throw new UnauthorizedException();

        if (['admin', 'superadmin'].includes(user.role)) return true;

        const vacancy = await this.prisma.vacancy.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!vacancy) throw new NotFoundException('Vacancy not found');

        if (vacancy.userId !== user.sub)
            throw new ForbiddenException('Not your resource');

        return true;
    }
}
