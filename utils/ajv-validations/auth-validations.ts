import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import type { LoginUserInput, RegisterUserInput } from '../../types/auth-input';
import { EMAIL_REGEX } from '../email-regex';
import type { GetUserInput, UpdateUserInput } from '../../types/user-input';
import { User } from '../../models/User';

// Field constraints
const USERNAME_MIN_LENGTH = 8;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 10;

// Error messages
const USER_MESSAGES = {
  OBJECT_TYPE: 'The request must be a json object',
  NAME_REQUIRED: 'Please, provide an username',
  NAME_TYPE: 'The name must be a string',
  NAME_MIN: `The username must be at least ${USERNAME_MIN_LENGTH} characters long`,
  NAME_MAX: `The maximum number of characters for the username is ${USERNAME_MAX_LENGTH}`,
  NAME_IN_USE: 'This username is already in use',
  EMAIL_REQUIRED: 'Please, provide an email',
  EMAIL_TYPE: 'The email must be a string',
  EMAIL_INVALID: 'The email provided is invalid',
  EMAIL_IN_USE: 'This email is already in use',
  PASSWORD_REQUIRED: 'Please, provide a password',
  PASSWORD_TYPE: 'The password must be a string',
  PASSWORD_MIN: `The password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  PASSWORD_INCORRECT: 'The password is incorrect',
  ID_TYPE: "The user's id must be a number or a string",
  ID_REQUIRED: 'Please, provide the id of a user',
  NOT_FOUND_BY_EMAIL: 'No user was found with the provided email',
  NOT_FOUND_BY_ID: 'No user was found with the provided id',
};

const ajv = ajvErrors(new Ajv({ allErrors: true }));

// Extra Keywords

ajv.addKeyword({
  keyword: 'nameIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: nameIsAvailable,
});

ajv.addKeyword({
  keyword: 'emailIsAvailable',
  async: true,
  type: 'string',
  schema: false,
  validate: emailIsAvailable,
});

ajv.addKeyword({
  keyword: 'userExistsByEmail',
  async: true,
  type: 'string',
  schema: false,
  validate: userExistsByEmail,
});

ajv.addKeyword({
  keyword: 'userExistsById',
  async: true,
  type: 'string',
  schema: false,
  validate: userExistsById,
});

async function nameIsAvailable(name: string): Promise<boolean> {
  const users = await User.find({ name });
  return users.length === 0;
}

async function emailIsAvailable(email: string): Promise<boolean> {
  const users = await User.find({ email });
  return users.length === 0;
}

async function userExistsByEmail(email: string): Promise<boolean> {
  const user = await User.findOne({ email });
  return !!user;
}

async function userExistsById(id: string | number): Promise<boolean> {
  const user = await User.findById(id);
  return !!user;
}

// Auth Schemas
const registerUserSchema = ajv.compile<RegisterUserInput>({
  $async: true,
  type: 'object',
  required: ['name', 'email', 'password'],

  properties: {
    name: {
      type: 'string',
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
      nameIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.NAME_TYPE,
        minLength: USER_MESSAGES.NAME_MIN,
        maxLength: USER_MESSAGES.NAME_MAX,
        nameIsAvailable: USER_MESSAGES.NAME_IN_USE,
      },
    },

    email: {
      type: 'string',
      pattern: EMAIL_REGEX,
      emailIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.EMAIL_TYPE,
        pattern: USER_MESSAGES.EMAIL_INVALID,
        emailIsAvailable: USER_MESSAGES.EMAIL_IN_USE,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
    required: {
      name: USER_MESSAGES.NAME_REQUIRED,
      email: USER_MESSAGES.EMAIL_REQUIRED,
      password: USER_MESSAGES.PASSWORD_REQUIRED,
    },
  },
});

const loginUserSchema = ajv.compile<LoginUserInput>({
  $async: true,
  type: 'object',
  required: ['email', 'password'],

  properties: {
    email: {
      type: 'string',
      pattern: EMAIL_REGEX,
      userExistsByEmail: true,
      errorMessage: {
        type: USER_MESSAGES.EMAIL_TYPE,
        pattern: USER_MESSAGES.EMAIL_INVALID,
        userExistsByEmail: USER_MESSAGES.NOT_FOUND_BY_EMAIL,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
    required: {
      email: USER_MESSAGES.EMAIL_REQUIRED,
      password: USER_MESSAGES.PASSWORD_REQUIRED,
    },
  },
});

// User schemas
const updateUserSchema = ajv.compile<UpdateUserInput>({
  $async: true,
  type: 'object',
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      userExistsById: true,

      errorMessage: {
        userExistsById: USER_MESSAGES.NOT_FOUND_BY_ID,
      },
    },

    name: {
      type: 'string',
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
      nameIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.NAME_TYPE,
        minLength: USER_MESSAGES.NAME_MIN,
        maxLength: USER_MESSAGES.NAME_MAX,
        nameIsAvailable: USER_MESSAGES.NAME_IN_USE,
      },
    },

    email: {
      type: 'string',
      pattern: EMAIL_REGEX,
      emailIsAvailable: true,
      errorMessage: {
        type: USER_MESSAGES.EMAIL_TYPE,
        pattern: USER_MESSAGES.EMAIL_INVALID,
        emailIsAvailable: USER_MESSAGES.EMAIL_IN_USE,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
    required: {
      id: USER_MESSAGES.ID_REQUIRED,
    },
  },
});

const getUserSchema = ajv.compile<GetUserInput>({
  $async: true,
  type: 'object',
  required: ['id'],

  properties: {
    id: {
      type: 'string',
      userExistsById: true,

      errorMessage: {
        userExistsById: USER_MESSAGES.NOT_FOUND_BY_ID,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
  },
});

const deleteOwnUserSchema = ajv.compile<UpdateUserInput>({
  $async: true,
  type: 'object',
  required: ['id', 'password'],

  properties: {
    id: {
      type: 'string',
      userExistsById: true,

      errorMessage: {
        userExistsById: USER_MESSAGES.NOT_FOUND_BY_ID,
      },
    },

    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,

      errorMessage: {
        type: USER_MESSAGES.PASSWORD_TYPE,
        minLength: USER_MESSAGES.PASSWORD_MIN,
      },
    },
  },

  errorMessage: {
    type: USER_MESSAGES.OBJECT_TYPE,
    required: {
      id: USER_MESSAGES.ID_REQUIRED,
      password: USER_MESSAGES.PASSWORD_REQUIRED,
    },
  },
});

export {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  getUserSchema,
  deleteOwnUserSchema,
  USER_MESSAGES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
};
