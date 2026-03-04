import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireBoardAccess, requireBoardAdmin } from '../middleware/boardAccess.middleware';
import {
  getBoards, createBoard, getBoard, updateBoard,
  deleteBoard, addMember, removeMember, updateMemberRole, reorderColumns
} from '../controllers/board.controller';

export const boardRouter = Router();

boardRouter.use(authenticate);

boardRouter.get('/', getBoards);
boardRouter.post('/', createBoard);
boardRouter.get('/:boardId', requireBoardAccess, getBoard);
boardRouter.patch('/:boardId', requireBoardAccess, requireBoardAdmin, updateBoard);
boardRouter.delete('/:boardId', requireBoardAccess, requireBoardAdmin, deleteBoard);
boardRouter.post('/:boardId/members', requireBoardAccess, requireBoardAdmin, addMember);
boardRouter.delete('/:boardId/members/:userId', requireBoardAccess, requireBoardAdmin, removeMember);
boardRouter.patch('/:boardId/members/:userId', requireBoardAccess, requireBoardAdmin, updateMemberRole);
boardRouter.patch('/:boardId/columns/reorder', requireBoardAccess, reorderColumns);