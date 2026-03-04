import { Schema, model, Document, Types } from 'mongoose';

export interface IColumn extends Document {
  boardId: Types.ObjectId;
  name: string;
  cardOrder: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    name: { type: String, required: true, trim: true },
    cardOrder: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
  },
  { timestamps: true }
);

export const Column = model<IColumn>('Column', columnSchema);