import { Schema, model, Document, Types } from 'mongoose';

export type CardLabel = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  mentions: Types.ObjectId[];
  createdAt: Date;
}

export interface ICard extends Document {
  boardId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  assigneeId?: Types.ObjectId;
  label?: CardLabel;
  comments: IComment[];
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    label: { type: String, enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Card = model<ICard>('Card', cardSchema);