import { AuditListener } from './audit.listener';

describe('AuditListener', () => {
    let audit: { log: jest.Mock };
    let listener: AuditListener;

    beforeEach(() => {
        audit = { log: jest.fn() };
        listener = new AuditListener(audit as any);
    });

    it('logs vacancy creation event', async () => {
        await listener.handleCreated({
            userId: 'user-1',
            vacancy: { id: 'vacancy-1' },
            req: {
                ip: '127.0.0.1',
                headers: { 'user-agent': 'jest' },
            },
        });

        expect(audit.log).toHaveBeenCalledWith({
            userId: 'user-1',
            action: 'VACANCY_CREATED',
            entityType: 'vacancy',
            entityId: 'vacancy-1',
            ipAddress: '127.0.0.1',
            userAgent: 'jest',
        });
    });
});
