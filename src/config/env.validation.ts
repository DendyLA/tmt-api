const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const;

export function validateEnvironment(env: NodeJS.ProcessEnv = process.env) {
    const missing = REQUIRED_ENV.filter((key) => !env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required env variables: ${missing.join(', ')}`);
    }

    if (
        env.NODE_ENV === 'production' &&
        env.JWT_SECRET &&
        env.JWT_SECRET.length < 32
    ) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
}

export function envFlag(value: string | undefined, defaultValue = false) {
    if (value === undefined) return defaultValue;
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}
