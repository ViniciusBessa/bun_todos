import mongoose from 'mongoose';
import {
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USER_MESSAGES,
} from '../utils/ajv-validations/auth-validations';
import type { UserPayload } from '../types/user-payload';
import { SignJWT } from 'jose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, USER_MESSAGES.NAME_REQUIRED],
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, USER_MESSAGES.EMAIL_REQUIRED],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      minLength: PASSWORD_MIN_LENGTH,
      required: [true, USER_MESSAGES.PASSWORD_REQUIRED],
      trim: true,
    },

    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },

    createdAt: {
      type: Date,
    },

    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    methods: {
      async getPayload(): Promise<UserPayload> {
        return {
          _id: this._id,
          name: this.name,
          email: this.email,
          role: this.role,
          createdAt: this.createdAt!,
          updatedAt: this.updatedAt!,
        };
      },

      async comparePassword(comparedString: string): Promise<boolean> {
        return await Bun.password.verify(
          comparedString,
          this.password,
          'bcrypt'
        );
      },

      async createToken(payload: UserPayload): Promise<string> {
        const token = await new SignJWT({ ...payload })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime(Bun.env.JWT_EXPIRES_IN || '30d')
          .sign(new TextEncoder().encode(Bun.env.JWT_SECRET as string));
        return token;
      },
    },
  }
);

UserSchema.pre('save', async function () {
  this.password = await Bun.password.hash(this.password, 'bcrypt');
});

UserSchema.pre(['updateOne', 'findOneAndUpdate'], async function () {
  const update = this.getUpdate();

  if (update && 'password' in update) {
    this.setUpdate({
      ...update,
      password: await Bun.password.hash(update.password, 'bcrypt'),
    });
  }
});

const User = mongoose.model('User', UserSchema);
export { User };
