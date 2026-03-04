import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

const SALT_ROUNDS = 12;
const REFRESH_EXPIRES_DAYS = 7;

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'email, name, and password are required' },
    });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({
      error: { code: 'EMAIL_TAKEN', message: 'Email already in use' },
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, name, passwordHash });

  return res.status(201).json({ message: 'Account created', userId: user._id });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const payload = { userId: user._id.toString(), name: user.name };
  const accessToken = signAccessToken(payload);
  const rawRefreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user._id,
    token: hashToken(rawRefreshToken),
    expiresAt,
  });

  setRefreshCookie(res, rawRefreshToken);

  return res.json({
    accessToken,
    user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({
      error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token required' },
    });
  }

  const payload = verifyRefreshToken(token);
  if (!payload) {
    return res.status(401).json({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
    });
  }

  const hashed = hashToken(token);
  const stored = await RefreshToken.findOne({ token: hashed, userId: payload.userId });

  if (!stored) {
    // Token reuse — wipe all sessions
    await RefreshToken.deleteMany({ userId: payload.userId });
    return res.status(401).json({
      error: { code: 'TOKEN_REUSE', message: 'Token reuse detected. All sessions invalidated.' },
    });
  }

  // Rotate
  await stored.deleteOne();
  const cleanPayload = { userId: payload.userId, name: payload.name };
  const newAccessToken = signAccessToken(cleanPayload);
  const newRawRefreshToken = signRefreshToken(cleanPayload);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: payload.userId,
    token: hashToken(newRawRefreshToken),
    expiresAt,
  });

  setRefreshCookie(res, newRawRefreshToken);

  return res.json({ accessToken: newAccessToken });
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token: hashToken(token) });
  }
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out' });
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.userId).select('-passwordHash');
  if (!user) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
  }
  return res.json(user);
}