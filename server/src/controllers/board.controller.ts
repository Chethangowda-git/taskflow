import { Response } from 'express';
import { Board } from '../models/board.model';
import { Column } from '../models/column.model';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/boards
export async function getBoards(req: AuthRequest, res: Response) {
  const boards = await Board.find({ 'members.userId': req.user!.userId });
  return res.json(boards);
}

// POST /api/boards
export async function createBoard(req: AuthRequest, res: Response) {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name is required' } });
  }

  const board = await Board.create({
    name,
    description,
    ownerId: req.user!.userId,
    members: [{ userId: req.user!.userId, role: 'admin' }],
    columnOrder: [],
  });

  return res.status(201).json(board);
}

// GET /api/boards/:boardId
export async function getBoard(req: AuthRequest, res: Response) {
  const board = await Board.findById(req.params.boardId);
  const columns = await Column.find({ boardId: req.params.boardId });
  const cards = await Card.find({ boardId: req.params.boardId });
  return res.json({ board, columns, cards });
}

// PATCH /api/boards/:boardId
export async function updateBoard(req: AuthRequest, res: Response) {
  const { name, description } = req.body;
  const board = await Board.findByIdAndUpdate(
    req.params.boardId,
    { name, description },
    { new: true }
  );
  return res.json(board);
}

// DELETE /api/boards/:boardId
export async function deleteBoard(req: AuthRequest, res: Response) {
  await Card.deleteMany({ boardId: req.params.boardId });
  await Column.deleteMany({ boardId: req.params.boardId });
  await Board.findByIdAndDelete(req.params.boardId);
  return res.json({ message: 'Board deleted' });
}

// POST /api/boards/:boardId/members
export async function addMember(req: AuthRequest, res: Response) {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  const board = req.body._board;
  const alreadyMember = board.members.some(
    (m: { userId: { toString: () => string } }) => m.userId.toString() === user._id.toString()
  );
  if (alreadyMember) {
    return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'User is already a member' } });
  }

  board.members.push({ userId: user._id, role: 'member' });
  await board.save();
  return res.status(201).json(board);
}

// DELETE /api/boards/:boardId/members/:userId
export async function removeMember(req: AuthRequest, res: Response) {
  const board = req.body._board;
  board.members = board.members.filter(
    (m: { userId: { toString: () => string } }) => m.userId.toString() !== req.params.userId
  );
  await board.save();
  return res.json(board);
}

// PATCH /api/boards/:boardId/members/:userId
export async function updateMemberRole(req: AuthRequest, res: Response) {
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'role must be admin or member' } });
  }

  const board = req.body._board;
  const member = board.members.find(
    (m: { userId: { toString: () => string } }) => m.userId.toString() === req.params.userId
  );
  if (!member) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Member not found' } });
  }

  member.role = role;
  await board.save();
  return res.json(board);
}

// PATCH /api/boards/:boardId/columns/reorder
export async function reorderColumns(req: AuthRequest, res: Response) {
  const { columnOrder } = req.body;
  const board = await Board.findByIdAndUpdate(
    req.params.boardId,
    { columnOrder },
    { new: true }
  );
  return res.json(board);
}