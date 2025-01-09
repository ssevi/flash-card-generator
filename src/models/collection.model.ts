// server/src/models/collection.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  title: string;
  description: string;
  category: string;
  userId: mongoose.Types.ObjectId;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: 10
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Collection = mongoose.model<ICollection>('Collection', collectionSchema);