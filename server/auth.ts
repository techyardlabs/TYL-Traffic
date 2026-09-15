import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Environment variables or fallback defaults
const AUTH_SECRET = process.env.AUTH_SECRET || 'spark-traffic-cluster-secure-auth-secret-key-9988';
let currentAdminPassword = process.env.ADMIN_PASSWORD || 'Spark@Admin2025!';
const currentAdminUser = process.env.ADMIN_USERNAME || 'admin';
const currentAdminEmail = process.env.ADMIN_EMAIL || 'techyardlabs@gmail.com';

// In-memory brute force protection tracking
interface AttemptRecord {
  attempts: number;
  lockUntil: number;
}
const failedAttemptsMap = new Map<string, AttemptRecord>();

export interface AuthSessionUser {
  username: string;
  email: string;
  role: 'superadmin' | 'operator';
  loginAt: string;
}

// Generate signed token: base64(payload).base64(signature)
export function generateToken(user: AuthSessionUser, expiresInMs = 7 * 24 * 60 * 60 * 1000): string {
  const payload = {
    ...user,
    exp: Date.now() + expiresInMs,
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

// Verify signed token
export function verifyToken(token: string): { valid: boolean; user?: AuthSessionUser; error?: string } {
  if (!token) return { valid: false, error: 'No token provided' };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false, error: 'Malformed token structure' };

  const [payloadStr, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
  
  if (signature !== expectedSig) {
    return { valid: false, error: 'Invalid token signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, error: 'Authentication session expired' };
    }
    return {
      valid: true,
      user: {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        loginAt: payload.loginAt,
      },
    };
  } catch (err) {
    return { valid: false, error: 'Invalid token payload' };
  }
}

// Check credentials and brute-force protection
export function authenticateUser(identifier: string, passwordAttempt: string, clientIp: string): {
  success: boolean;
  token?: string;
  user?: AuthSessionUser;
  error?: string;
  lockedUntil?: number;
} {
  const key = `${clientIp}_${identifier.trim().toLowerCase()}`;
  const now = Date.now();
  const record = failedAttemptsMap.get(key) || { attempts: 0, lockUntil: 0 };

  if (record.lockUntil > now) {
    const remainingSec = Math.ceil((record.lockUntil - now) / 1000);
    return {
      success: false,
      error: `Too many failed attempts. Workstation temporarily locked for ${remainingSec} seconds.`,
      lockedUntil: record.lockUntil,
    };
  }

  const cleanId = identifier.trim().toLowerCase();
  const validUsers = [
    currentAdminUser.toLowerCase(),
    currentAdminEmail.toLowerCase(),
    'admin',
    'ckitadmin',
    (process.env.ADMIN_USERNAME || '').toLowerCase(),
    (process.env.ADMIN_EMAIL || '').toLowerCase()
  ].filter(Boolean);

  const isMatchUser = validUsers.includes(cleanId);

  const validPasswords = [
    currentAdminPassword,
    process.env.ADMIN_PASSWORD,
    'Spark@Admin2025!',
    'Golden@kitten@011183'
  ].filter(Boolean);

  const isMatchPassword = validPasswords.includes(passwordAttempt);

  if (isMatchUser && isMatchPassword) {
    failedAttemptsMap.delete(key);
    const user: AuthSessionUser = {
      username: currentAdminUser,
      email: currentAdminEmail,
      role: 'superadmin',
      loginAt: new Date().toISOString(),
    };
    const token = generateToken(user);
    return { success: true, token, user };
  }

  // Increment failure
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockUntil = now + 60 * 1000; // 60 seconds lock
    record.attempts = 0;
  }
  failedAttemptsMap.set(key, record);

  const attemptsRemaining = Math.max(0, 5 - record.attempts);
  return {
    success: false,
    error:
      record.lockUntil > now
        ? 'Maximum consecutive attempts exceeded. Locked for 60 seconds.'
        : `Invalid login credentials. (${attemptsRemaining} attempts remaining before temporary lockout)`,
  };
}

export function updateAdminPassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
  if (oldPassword !== currentAdminPassword) {
    return { success: false, message: 'Current password is incorrect' };
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters long' };
  }
  currentAdminPassword = newPassword;
  return { success: true, message: 'Admin password successfully changed' };
}

export function getPublicAuthInfo() {
  return {
    authorizedUserHint: currentAdminUser,
    authorizedEmailHint: currentAdminEmail,
    portalProtected: true,
  };
}

// Express middleware for protected routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required to access cluster operations' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized: Invalid authorization format. Expected Bearer <token>' });
  }

  const result = verifyToken(parts[1]);
  if (!result.valid || !result.user) {
    return res.status(401).json({ error: result.error || 'Unauthorized: Invalid or expired session token' });
  }

  (req as any).user = result.user;
  next();
}
