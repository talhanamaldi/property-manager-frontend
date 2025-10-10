export type User = {
    email: string;
    username?: string;
    password: string;
    isAdmin?: boolean;
};

export type AuthResponse = {
    token: string;
    expiresAt: string;
};
