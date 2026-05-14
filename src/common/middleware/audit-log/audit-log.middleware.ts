import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../../../modules/audit-log/audit-log.service';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
    constructor(private auditLog: AuditLogService) {}

    private readonly ignoredRoutes = ['/health', '/metrics', '/favicon.ico'];

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        if (this.ignoredRoutes.includes(req.originalUrl)) {
            return next();
        }

        res.on('finish', async () => {
            const duration = Date.now() - start;

            const user = (req as any).user;

            const ignoredMethods = ['OPTIONS'];

            if (ignoredMethods.includes(req.method)) return;

            const skipReadLogs = req.method === 'GET' && res.statusCode === 200;

            if (skipReadLogs) return;

            await this.auditLog.log({
                userId: user?.sub,
                action: `${req.method} ${req.originalUrl}`,
                entityType: 'http_request',
                entityId: req.originalUrl,
                metadata: {
                    statusCode: res.statusCode,
                    duration,
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
        });

        next();
    }
}
