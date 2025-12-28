
declare namespace Express {
    export interface Request {
        user?: {
            id?: string;
            email?: string;
            name?: string;
            accessToken?: string;
            role: import('../../middlwares/roleCheck.ts').UserRole;
        };
    }
}
