import { StatusCodes } from 'http-status-codes';
import supertest, { Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it, afterAll } from 'bun:test';
import { USER_MESSAGES } from '../utils/ajv-validations/auth-validations';
import type TestAgent from 'supertest/lib/agent';
import { connectDB } from '../db/db';
import mongoose from 'mongoose';

describe('Auth Endpoints', () => {
  const request: TestAgent<Test> = supertest(app);

  beforeAll(async () => {
    await connectDB(Bun.env.MONGO_URI as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Logged in as User', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'taqqiq@gmail.com', password: 'taqqiqberlin' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/auth/user should successfully return the user info', async () => {
      const response = await request
        .get('/api/v1/auth/user')
        .set({ Authorization: token });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });
  });

  describe('Logged out', () => {
    it('POST /api/v1/auth/register should fail to create an account by missing the name', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'test@gmail.com',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_REQUIRED);
    });

    it('POST /api/v1/auth/register should fail to create an account by name too short', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'test',
        email: 'test@gmail.com',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MIN);
    });

    it('POST /api/v1/auth/register should fail to create an account by name too long', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'test'.repeat(100),
        email: 'test@gmail.com',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_MAX);
    });

    it('POST /api/v1/auth/register should fail to create an account by name in use', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'Syntyche Joann',
        email: 'test@gmail.com',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.NAME_IN_USE);
    });

    it('POST /api/v1/auth/register should fail to create an account by missing the email', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'justTesting',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_REQUIRED);
    });

    it('POST /api/v1/auth/register should fail to create an account by invalid email', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'justTesting',
        email: 'test@',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_INVALID);
    });

    it('POST /api/v1/auth/register should fail to create an account by email in use', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'justTesting',
        email: 'syntyche@gmail.com',
        password: 'newPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_IN_USE);
    });

    it('POST /api/v1/auth/register should fail to create an account by missing the password', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'justTesting',
        email: 'test@gmail.com',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_REQUIRED);
    });

    it('POST /api/v1/auth/register should fail to create an account by password too short', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'justTesting',
        email: 'test@gmail.com',
        password: 'short',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_MIN);
    });

    it('POST /api/v1/auth/register should successfully create an account', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        email: 'testEmail@gmail.com',
        password: 'TestingUserPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });

    it('POST /api/v1/auth/login should fail to login by user not found', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'test2@gmail.com',
        password: 'testPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.NOT_FOUND_BY_EMAIL);
    });

    it('POST /api/v1/auth/login should fail to login by not providing an email', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        password: 'newPassword',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_REQUIRED);
    });

    it('POST /api/v1/auth/login should fail to login by providing an invalid email', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'invalidEmail@',
        password: 'newPassword',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.EMAIL_INVALID);
    });

    it('POST /api/v1/auth/login should fail to login by not providing a password', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'syntyche@gmail.com',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_REQUIRED);
    });

    it('POST /api/v1/auth/login should fail to login by password too short', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'syntyche@gmail.com',
        password: 'pass',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_MIN);
    });

    it('POST /api/v1/auth/login should fail to login by incorrect password', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'taqqiq@gmail.com',
        password: 'wrongPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(USER_MESSAGES.PASSWORD_INCORRECT);
    });

    it('POST /api/v1/auth/login should successfully log in the user', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'taqqiq@gmail.com',
        password: 'taqqiqberlin',
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });

    it('GET /api/v1/auth/user should fail to return the user info by unauthorized', async () => {
      const response = await request.get('/api/v1/auth/user');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        "It's necessary to login to see this content"
      );
    });
  });
});
