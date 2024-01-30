import mongoose, { Schema } from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 80,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      minLength: 20,
      maxLength: 200,
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
