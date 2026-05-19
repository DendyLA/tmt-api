export type AuthenticatedUser = {
    sub: string;
    email: string;
    role: string | null;
    permissions: string[];
};
