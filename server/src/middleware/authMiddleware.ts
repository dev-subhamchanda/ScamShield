import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/authService.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'citizen' | 'security_analyst' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware that extracts and verifies JWT from Authorization header,
 * attaching the authenticated user payload to req.user if valid.
 */
export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload && payload.id) {
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role as 'citizen' | 'security_analyst' | 'admin',
      };
    }
  }
  next();
}

/**
 * Enforces that a valid authenticated user session must be present.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required to perform this action.',
    });
    return;
  }
  next();
}

/**
 * Enforces that the authenticated user must possess the 'admin' role.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid administrative credentials required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Access restricted to administrative security officers.',
    });
    return;
  }

  next();
}
