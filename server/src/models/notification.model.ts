import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType = 'assigned' | 'mentioned' | 'due_soon';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: NotificationType;
  cardId: Types.ObjectId;
  boardId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['assigned', 'mentioned', 'due_soon'], required: true },
    cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);