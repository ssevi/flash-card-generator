// server/src/models/teacher.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  password: string;
  department: string;
  permissions: {
    canUpload: {
      type: boolean;
      default: boolean;
    };
    canDownload: {
      type: boolean;
      default: boolean;
    };
    canEdit: {
      type: boolean;
      default: boolean;
    };
    canDelete: {
      type: boolean;
      default: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  permissions: {
    canUpload: {
      type: Boolean,
      default: false
    },
    canDownload: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure appropriate permissions
teacherSchema.pre('save', function(next) {
  if (this.permissions && this.permissions.canUpload) {
    this.permissions.canEdit = true;
    this.permissions.canDelete = true;
  }
  next();
});

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);