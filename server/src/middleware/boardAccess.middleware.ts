import { Response, NextFunction } from 'express';
import { Board } from '../models/board.model';
import { AuthRequest } from './auth.middleware';

export async function requireBoardAccess(req: AuthRequest, res: Response, next: NextFunction) {
  const boardId = req.params.boardId;
  const userId = req.user!.userId;

  const board = await Board.findById(boardId);
  if (!board) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
  }

  const isMember = board.members.some((m) => m.userId.toString() === userId);
  if (!isMember) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not a board member' } });
  }

  req.body._board = board; // attach board to request for controllers
  next();
}

export async function requireBoardAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const board = req.body._board;
  const userId = req.user!.userId;

  const member = board.members.find((m: { userId: { toString: () => string } }) => m.userId.toString() === userId);
  if (!member || member.role !== 'admin') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }

  next();
}