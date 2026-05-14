import { AuditLogMiddleware } from './audit-log.middleware';

describe('AuditLogMiddleware', () => {
    it('should be defined', () => {
        expect(new AuditLogMiddleware()).toBeDefined();
    });
});
