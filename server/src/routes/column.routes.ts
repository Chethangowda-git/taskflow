import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireBoardAccess } from '../middleware/boardAccess.middleware';
import { createColumn, updateColumn, deleteColumn } from '../controllers/column.controller';

export const columnRouter = Router();

columnRouter.use(authenticate);

columnRouter.post('/boards/:boardId/columns', requireBoardAccess, createColumn);
columnRouter.patch('/columns/:columnId', updateColumn);
columnRouter.delete('/columns/:columnId', deleteColumn);