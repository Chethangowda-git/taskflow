import { Response } from 'express';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/users/search?q=
export async function searchUsers(req: AuthRequest, res: Response) {
  const q = req.query.q as string;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  }).select('-passwordHash').limit(10);

  return res.json(users);
}