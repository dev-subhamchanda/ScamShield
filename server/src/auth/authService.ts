import crypto from 'crypto';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'security_analyst' | 'admin';
  trustScore: number;
  createdAt: string;
}

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'scamshield-super-secret-production-token-key-2026';

// In-Memory User Vault
const usersDb = new Map<string, StoredUser>();

// Helper: Hash password with PBKDF2
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Helper: Custom lightweight JWT generation (HMAC-SHA256)
export function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days expiration
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Helper: Verify JWT token
export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Seed Initial Demo Accounts for instant user testing
function seedDefaultUsers() {
  const defaultAccounts = [
    {
      id: 'USR-CITIZEN-01',
      email: 'citizen@scamshield.org',
      password: 'Citizen123!',
      displayName: 'Rahul Sharma',
      role: 'citizen' as const,
      trustScore: 98,
    },
    {
      id: 'USR-ANALYST-01',
      email: 'analyst@scamshield.org',
      password: 'Analyst123!',
      displayName: 'Dr. Maya Patel',
      role: 'security_analyst' as const,
      trustScore: 100,
    },
    {
      id: 'USR-ADMIN-01',
      email: 'admin@scamshield.org',
      password: 'Admin123!',
      displayName: 'Chief Security Officer',
      role: 'admin' as const,
      trustScore: 100,
    },
  ];

  for (const acc of defaultAccounts) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(acc.password, salt);
    usersDb.set(acc.email.toLowerCase(), {
      id: acc.id,
      email: acc.email.toLowerCase(),
      displayName: acc.displayName,
      role: acc.role,
      trustScore: acc.trustScore,
      createdAt: new Date().toISOString(),
      passwordHash,
      salt,
    });
  }
}

seedDefaultUsers();

export function registerUser(params: {
  email: string;
  password: string;
  displayName?: string;
  role?: 'citizen' | 'security_analyst';
}): { user: UserProfile; token: string } {
  const cleanEmail = params.email.trim().toLowerCase();
  if (usersDb.has(cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  if (params.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(params.password, salt);
  const id = `USR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const role = params.role || 'citizen';
  const displayName = params.displayName?.trim() || cleanEmail.split('@')[0];

  const newUser: StoredUser = {
    id,
    email: cleanEmail,
    displayName,
    role,
    trustScore: 95,
    createdAt: new Date().toISOString(),
    passwordHash,
    salt,
  };

  usersDb.set(cleanEmail, newUser);

  const token = generateToken({ id, email: cleanEmail, role });
  const { passwordHash: _, salt: __, ...userProfile } = newUser;
  return { user: userProfile, token };
}

export function authenticateUser(email: string, password: string): { user: UserProfile; token: string } {
  const cleanEmail = email.trim().toLowerCase();
  const stored = usersDb.get(cleanEmail);
  if (!stored) {
    throw new Error('Invalid email or password.');
  }

  const computedHash = hashPassword(password, stored.salt);
  if (computedHash !== stored.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const token = generateToken({ id: stored.id, email: stored.email, role: stored.role });
  const { passwordHash: _, salt: __, ...userProfile } = stored;
  return { user: userProfile, token };
}

export function getUserById(id: string): UserProfile | null {
  for (const stored of usersDb.values()) {
    if (stored.id === id) {
      const { passwordHash: _, salt: __, ...userProfile } = stored;
      return userProfile;
    }
  }
  return null;
}

export function getDemoUser(role: 'citizen' | 'analyst' | 'admin'): { user: UserProfile; token: string } {
  const emailMap = {
    citizen: 'citizen@scamshield.org',
    analyst: 'analyst@scamshield.org',
    admin: 'admin@scamshield.org',
  };
  const email = emailMap[role];
  const stored = usersDb.get(email);
  if (!stored) throw new Error('Demo account not found.');

  const token = generateToken({ id: stored.id, email: stored.email, role: stored.role });
  const { passwordHash: _, salt: __, ...userProfile } = stored;
  return { user: userProfile, token };
}
