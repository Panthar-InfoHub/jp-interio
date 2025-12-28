import { NextFunction, Request, Response } from "express";


export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    VENDOR = "VENDOR",
    USER = "USER"
}

const roleAuth = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

export const isSuperAdmin = roleAuth([UserRole.SUPER_ADMIN]);
export const isAdmin = roleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
export const isVendor = roleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VENDOR]);