import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { searchUsers } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get('/search', searchUsers);