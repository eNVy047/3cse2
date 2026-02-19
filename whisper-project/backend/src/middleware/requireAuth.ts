import type { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
        return res.status(401).json({ error: "Unauthorized - Authentication required" });
    }
    next();
};
