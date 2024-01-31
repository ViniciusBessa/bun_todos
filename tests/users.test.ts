import { StatusCodes } from 'http-status-codes';
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import supertest, { Test } from 'supertest';
import app from '../app';
import { USER_MESSAGES } from '../utils/ajv-validations/auth-validations';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import type TestAgent from 'supertest/lib/agent';
import { connectDB } from '../db/db';
import mongoose from 'mongoose';

describe('User Endpoints', () => {
  const request: TestAgent<Test> = supertest(app);

  beforeAll(async () => {
    await connectDB(Bun.env.MONGO_URI as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Logged in as Admin', () => {
    let token: string;
    let id: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'richard@gmail.com', password: 'richardastrid' });

      token = 'Bearer ' + response.body.token;
      id = response.body.user._id;
    });

    it('GET /api/v1/users should return all users in the database', async () => {
      const response = await request
        .get('/api/v1/users')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.users.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/v1/users/:userId should return an user entry', async () => {
      const response = await request
        .get('/api/v1/users/65b8060302c0c7f1643f3390')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual('Syntyche Joann');
      expect(response.body.user.email).toEqual('syntyche@gmail.com');
      expect(response.body.user.password).toBeFalsy();
    });

    it('PATCH /api/v1/users/:userId should fail to update by forbidden', async () => {
      const response = await request
        .patch(`/api/v1/users/1`)
        .send({ name: 'New Username' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by too short', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Name' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MIN);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by too long', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Name'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MAX);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by already in use', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Taqqiq Berlin' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/users/:userId should successfully update the name', async () => {
      const newName = 'A new name';
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: newName })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual(newName);
    });

    it('PATCH /api/v1/users/:userId should fail to update the email by invalid email', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_INVALID);
    });

    it('PATCH /api/v1/users/:userId should fail to update the email by already in use', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: 'syntyche@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_IN_USE);
    });

    it('PATCH /api/v1/users/:userId should successfully update the email', async () => {
      const newEmail = 'myNewEmail@gmail.com';
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: newEmail })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.email).toEqual(newEmail);
    });

    it('PATCH /api/v1/users/:userId should fail to update the password by too short', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ password: 'pass' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_MIN);
    });

    it('PATCH /api/v1/users/:userId should successfully update the password', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ password: 'newPassword' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it("DELETE /api/v1/users/:userId should successfully delete another user's account", async () => {
      const response = await request
        .delete('/api/v1/users/65b8060302c0c7f1643f3392')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by missing the password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_REQUIRED);
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by wrong password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'EPre#R+kara)(J' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_INCORRECT);
    });

    it("DELETE /api/v1/users/account should successfully delete the user's own account", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });
  });

  describe('Logged in as User', () => {
    let token: string;
    let id: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'john@gmail.com', password: 'johnastrid' });

      token = 'Bearer ' + response.body.token;
      id = response.body.user._id;
    });

    it('GET /api/v1/users should fail to return the users by forbidden', async () => {
      const response = await request
        .get('/api/v1/users')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.users).toBeFalsy();
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('GET /api/v1/users/:userId should fail to return any data by forbidden', async () => {
      const response = await request
        .get('/api/v1/users/65b8060302c0c7f1643f3390')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/users/:userId should fail to update by forbidden', async () => {
      const response = await request
        .patch(`/api/v1/users/1`)
        .send({ name: 'New Username' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by too short', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Name' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MIN);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by too long', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Name'.repeat(100) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MAX);
    });

    it('PATCH /api/v1/users/:userId should fail to update the name by already in use', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: 'Taqqiq Berlin' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_IN_USE);
    });

    it('PATCH /api/v1/users/:userId should successfully update the name', async () => {
      const newName = 'TheNewUsername';
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ name: newName })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual(newName);
    });

    it('PATCH /api/v1/users/:userId should fail to update the email by invalid email', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_INVALID);
    });

    it('PATCH /api/v1/users/:userId should fail to update the email by already in use', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: 'syntyche@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_IN_USE);
    });

    it('PATCH /api/v1/users/:userId should successfully update the email', async () => {
      const newEmail = 'theNewEmail@gmail.com';
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ email: newEmail })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.email).toEqual(newEmail);
    });

    it('PATCH /api/v1/users/:userId should fail to update the password by too short', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ password: 'pass' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_MIN);
    });

    it('PATCH /api/v1/users/:userId should successfully update the password', async () => {
      const response = await request
        .patch(`/api/v1/users/${id}`)
        .send({ password: 'newPassword' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it("DELETE /api/v1/users/1 should fail to delete another user's account by forbidden", async () => {
      const response = await request
        .delete('/api/v1/users/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by missing the password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_REQUIRED);
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by wrong password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'some_password' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_INCORRECT);
    });

    it("DELETE /api/v1/users/account should successfully delete the user's own account", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/users should fail to return the users by unauthorized', async () => {
      const response = await request.get('/api/v1/users');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.users).toBeFalsy();
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('GET /api/v1/users/1 should fail to return any data by unauthorized', async () => {
      const response = await request.get('/api/v1/users');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/users/:userId should fail to update the user by unauthorized', async () => {
      const response = await request.patch('/api/v1/users/1');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/users/account should fail to delete any account by unauthorized', async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'newPassword' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
