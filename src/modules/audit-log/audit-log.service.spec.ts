import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
    let prisma: any;
    let service: AuditLogService;

    beforeEach(() => {
        prisma = {
            activityLog: {
                create: jest.fn(),
            },
        };
        service = new AuditLogService(prisma);
    });

    it('creates activity log entry', async () => {
        const log = { id: 'log-1' };
        prisma.activityLog.create.mockResolvedValue(log);

        await expect(
            service.log({
                userId: 'user-1',
                action: 'TEST_ACTION',
                entityType: 'test',
                entityId: 'entity-1',
                metadata: { ok: true },
            }),
        ).resolves.toEqual(log);

        expect(prisma.activityLog.create).toHaveBeenCalledWith({
            data: {
                companyId: undefined,
                userId: 'user-1',
                action: 'TEST_ACTION',
                entityType: 'test',
                entityId: 'entity-1',
                metadata: { ok: true },
                ipAddress: undefined,
                userAgent: undefined,
            },
        });
    });
});
