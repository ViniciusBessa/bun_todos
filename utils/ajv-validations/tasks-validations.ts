import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import { Task } from '../../models/Task';
import type {
  CreateTaskInput,
  GetTaskInput,
  UpdateTaskInput,
} from '../../types/task-input';
import { userExistsById } from './auth-validations';

// Field constraints
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 200;

// Error messages
const TASK_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  TITLE_TYPE: "The task's title must be a string",
  TITLE_MIN_LENGTH: `The task's title must be at least ${TITLE_MIN_LENGTH} characters long`,
  TITLE_MAX_LENGTH: `The maximum number of characters for the task's title is ${TITLE_MAX_LENGTH}`,
  TITLE_REQUIRED: 'Please, provide a title for the task',
  DESCRIPTION_TYPE: "The task's description must be a string",
  DESCRIPTION_MIN_LENGTH: `The task's description must be at least ${DESCRIPTION_MIN_LENGTH} characters long`,
  DESCRIPTION_MAX_LENGTH: `The maximum number of characters for the task's description is ${DESCRIPTION_MAX_LENGTH}`,
  DESCRIPTION_REQUIRED: 'Please, provide a description for the task',
  COMPLETED_TYPE: "The task's description must be a boolean",
  USER_ID_TYPE: "The task's id must be a string",
  USER_ID_REQUIRED: 'Please, provide the id of a task',
  USER_NOT_FOUND: 'No user was found with the provided id',
  NOT_FOUND: 'No task was found with the provided id',
  ID_TYPE: "The task's id must be a string",
  ID_REQUIRED: 'Please, provide the id of a task',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords

ajv.addKeyword({
  keyword: 'taskExists',
  async: true,
  schema: false,
  validate: taskExists,
});

ajv.addKeyword({
  keyword: 'userExistsById',
  async: true,
  schema: false,
  validate: userExistsById,
});

ajv.addKeyword({
  keyword: 'userCanUpdateTask',
  async: true,
  schema: false,
  validate: taskExists,
});

async function taskExists(taskId: string): Promise<boolean> {
  const task = await Task.findById(taskId);
  return !!task;
}

// Creation Schema
const createTaskSchema = ajv.compile<CreateTaskInput>({
  type: 'object',
  $async: true,
  required: ['title', 'description', 'userId'],

  properties: {
    title: {
      type: 'string',
      minLength: TITLE_MIN_LENGTH,
      maxLength: TITLE_MAX_LENGTH,

      errorMessage: {
        type: TASK_MESSAGES.TITLE_TYPE,
        minLength: TASK_MESSAGES.TITLE_MIN_LENGTH,
        maxLength: TASK_MESSAGES.TITLE_MAX_LENGTH,
      },
    },

    description: {
      type: 'string',
      minLength: DESCRIPTION_MIN_LENGTH,
      maxLength: DESCRIPTION_MAX_LENGTH,

      errorMessage: {
        type: TASK_MESSAGES.DESCRIPTION_TYPE,
        minLength: TASK_MESSAGES.DESCRIPTION_MIN_LENGTH,
        maxLength: TASK_MESSAGES.DESCRIPTION_MAX_LENGTH,
      },
    },

    completed: {
      type: 'boolean',

      errorMessage: {
        type: TASK_MESSAGES.COMPLETED_TYPE,
      },
    },

    userId: {
      type: 'string',
      userExistsById: true,

      errorMessage: {
        type: TASK_MESSAGES.USER_ID_TYPE,
        userExistsById: TASK_MESSAGES.USER_NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TASK_MESSAGES.OBJECT_TYPE,
    required: {
      title: TASK_MESSAGES.TITLE_REQUIRED,
      description: TASK_MESSAGES.DESCRIPTION_REQUIRED,
      userId: TASK_MESSAGES.USER_ID_REQUIRED,
    },
  },
});

// Update Schema
const updateTaskSchema = ajv.compile<UpdateTaskInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      taskExists: true,

      errorMessage: {
        type: TASK_MESSAGES.ID_TYPE,
        taskExists: TASK_MESSAGES.NOT_FOUND,
      },
    },

    title: {
      type: 'string',
      minLength: TITLE_MIN_LENGTH,
      maxLength: TITLE_MAX_LENGTH,

      errorMessage: {
        type: TASK_MESSAGES.TITLE_TYPE,
        minLength: TASK_MESSAGES.TITLE_MIN_LENGTH,
        maxLength: TASK_MESSAGES.TITLE_MAX_LENGTH,
      },
    },

    description: {
      type: 'string',
      minLength: DESCRIPTION_MIN_LENGTH,
      maxLength: DESCRIPTION_MAX_LENGTH,

      errorMessage: {
        type: TASK_MESSAGES.DESCRIPTION_TYPE,
        minLength: TASK_MESSAGES.DESCRIPTION_MIN_LENGTH,
        maxLength: TASK_MESSAGES.DESCRIPTION_MAX_LENGTH,
      },
    },

    completed: {
      type: 'boolean',

      errorMessage: {
        type: TASK_MESSAGES.COMPLETED_TYPE,
      },
    },
  },

  errorMessage: {
    type: TASK_MESSAGES.OBJECT_TYPE,
    required: {
      id: TASK_MESSAGES.ID_REQUIRED,
      userId: TASK_MESSAGES.USER_ID_REQUIRED,
    },
  },
});

// Get Schema
const getTaskSchema = ajv.compile<GetTaskInput>({
  type: 'object',
  $async: true,
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      taskExists: true,

      errorMessage: {
        type: TASK_MESSAGES.ID_TYPE,
        taskExists: TASK_MESSAGES.NOT_FOUND,
      },
    },
  },

  errorMessage: {
    type: TASK_MESSAGES.OBJECT_TYPE,
    required: {
      id: TASK_MESSAGES.ID_REQUIRED,
    },
  },
});

export {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  TASK_MESSAGES,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
};
