import { Test, TestingModule } from '@nestjs/testing';
import { AuditListener } from './audit.listener';

describe('AuditListener', () => {
    let provider: AuditListener;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuditListener],
        }).compile();

        provider = module.get<AuditListener>(AuditListener);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
