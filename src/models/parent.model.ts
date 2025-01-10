import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IParent extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  childName: string;
  childAge: number;
  permissions: {
    canView: boolean;
    canDownload: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const parentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  childName: {
    type: String,
    required: true,
    trim: true
  },
  childAge: {
    type: Number,
    required: true,
    min: 0,
    max: 18
  },
  permissions: {
    canView: {
      type: Boolean,
      default: true
    },
    canDownload: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
parentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
parentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Parent = mongoose.model<IParent>('Parent', parentSchema);