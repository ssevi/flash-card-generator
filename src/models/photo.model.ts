// server/src/models/photo.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  url: string;
  collectionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'Collection ID is required']
  }
}, {
  timestamps: true
});

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);