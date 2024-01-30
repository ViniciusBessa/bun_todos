import mongoose, { Schema } from 'mongoose';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '../utils/ajv-validations/tasks-validations';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: TITLE_MIN_LENGTH,
      maxLength: TITLE_MAX_LENGTH,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      minLength: DESCRIPTION_MIN_LENGTH,
      maxLength: DESCRIPTION_MAX_LENGTH,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Task = mongoose.model('Task', TaskSchema);
export { Task };
