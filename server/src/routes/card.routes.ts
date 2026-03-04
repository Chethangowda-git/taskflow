import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createCard, getCard, updateCard, deleteCard, moveCard, addComment } from '../controllers/card.controller';

export const cardRouter = Router();

cardRouter.use(authenticate);

cardRouter.post('/columns/:columnId/cards', createCard);
cardRouter.get('/cards/:cardId', getCard);
cardRouter.patch('/cards/:cardId', updateCard);
cardRouter.delete('/cards/:cardId', deleteCard);
cardRouter.patch('/cards/:cardId/move', moveCard);
cardRouter.post('/cards/:cardId/comments', addComment);