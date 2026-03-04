import { Schema, model, Document, Types } from 'mongoose';

export type MemberRole = 'admin' | 'member';

export interface IBoardMember {
  userId: Types.ObjectId;
  role: MemberRole;
}

export interface IBoard extends Document {
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: IBoardMember[];
  columnOrder: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
      },
    ],
    columnOrder: [{ type: Schema.Types.ObjectId, ref: 'Column' }],
  },
  { timestamps: true }
);

export const Board = model<IBoard>('Board', boardSchema);