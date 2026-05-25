import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';

describe('JwtAuthGuard', () => {
    let reflector: Pick<Reflector, 'getAllAndOverride'>;
    let guard: JwtAuthGuard;

    beforeEach(() => {
        reflector = {
            getAllAndOverride: jest.fn(),
        };
        guard = new JwtAuthGuard(reflector as Reflector);
    });

    it('allows public route request without user', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

        expect(
            guard.handleRequest(null, null, null, createContext()),
        ).toBeNull();
    });

    it('throws on protected route without user', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(() =>
            guard.handleRequest(null, null, null, createContext()),
        ).toThrow(UnauthorizedException);
    });
});

function createContext() {
    return {
        getHandler: jest.fn(),
        getClass: jest.fn(),
    } as any;
}
