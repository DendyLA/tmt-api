import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // если есть критическая ошибка (например, битый токен)
        if (err) {
            return null;
        }

        // если токена нет или он невалидный
        if (!user) {
            return null;
        }

        return user;
    }
}
