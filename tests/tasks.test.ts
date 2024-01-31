import { StatusCodes } from 'http-status-codes';
import supertest, { Test } from 'supertest';
import app from '../app';
import { describe, expect, beforeAll, it, afterAll } from 'bun:test';
import { TASK_MESSAGES } from '../utils/ajv-validations/tasks-validations';
import { FORBIDDEN_ERROR_MESSAGE } from '../middlewares/restrict-access';
import { UNAUTHORIZED_ERROR_MESSAGE } from '../middlewares/login-required';
import type TestAgent from 'supertest/lib/agent';
import mongoose from 'mongoose';
import { connectDB } from '../db/db';

describe('Task Endpoints', () => {
  const request: TestAgent<Test> = supertest(app);

  beforeAll(async () => {
    await connectDB(Bun.env.MONGO_URI as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'syntychejoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/tasks should return all tasks in the database', async () => {
      const response = await request
        .get('/api/v1/tasks')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.tasks.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/tasks should return all completed tasks in the database', async () => {
      const response = await request
        .get('/api/v1/tasks?completed=true')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.tasks.length).toEqual(1);
    });

    it('GET /api/v1/tasks/:taskId should fail to return a task by not found', async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/tasks/:taskId should return a task', async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3310')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task.title).toEqual('Task Number 1');
      expect(response.body.task.description).toEqual(
        'The first task of the day'
      );
      expect(response.body.task.completed).toBeFalse();
    });

    it("GET /api/v1/tasks/:taskId should return another user's task", async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3311')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task.title).toEqual('Task Number 2');
      expect(response.body.task.description).toEqual(
        'The second task of the day'
      );
      expect(response.body.task.completed).toBeTrue();
    });

    it('POST /api/v1/tasks should fail to create a task by missing the title', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_REQUIRED);
    });

    it('POST /api/v1/tasks should fail to create a task by title too short', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My',
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MIN_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by title too long', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task'.repeat(50),
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MAX_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by missing the description', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_REQUIRED);
    });

    it('POST /api/v1/tasks should fail to create a task by description too short', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
          description: 'The',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MIN_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by description too long', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
          description: 'The new task for the day'.repeat(100),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MAX_LENGTH);
    });

    it('POST /api/v1/tasks should successfully create a task', async () => {
      const title = 'My Brand New Task';
      const description = 'The new task for the day';

      const response = await request
        .post('/api/v1/tasks')
        .send({ title, description })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual(title);
      expect(response.body.task.description).toEqual(description);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by not found', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .send({
          title: 'My Brand New Title',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by title too short', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ title: 'New' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MIN_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by title too long', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ title: 'New Title'.repeat(80) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MAX_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by description too short', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ description: 'My' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MIN_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by description too long', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ description: 'My New Description'.repeat(200) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MAX_LENGTH);
    });

    it("PATCH /api/v1/tasks/:taskId should fail to update another user's task", async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ description: 'My Brand New Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/tasks/:taskId should successfully update the task', async () => {
      const newTitle = 'The New Title';
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ title: newTitle })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual(newTitle);
    });

    it('DELETE /api/v1/tasks/:taskId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/tasks/:taskId should successfully delete a task', async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3314')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual('Task Number 5');
    });

    it("DELETE /api/v1/tasks/:taskId should successfully delete another user's task", async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3316')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual('Task Number 7');
    });
  });

  describe('Logged in as User', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'taqqiq@gmail.com', password: 'taqqiqberlin' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/tasks should return all tasks of the user', async () => {
      const response = await request
        .get('/api/v1/tasks')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.tasks.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/tasks should return all completed tasks of the user', async () => {
      const response = await request
        .get('/api/v1/tasks?completed=true')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.tasks.length).toEqual(1);
    });

    it('GET /api/v1/tasks/:taskId should fail to return a task by not found', async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('GET /api/v1/tasks/:taskId should return a task', async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3311')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task.title).toEqual('Task Number 2');
      expect(response.body.task.description).toEqual(
        'The second task of the day'
      );
      expect(response.body.task.completed).toBeTrue();
    });

    it("GET /api/v1/tasks/:taskId should return fail to another user's task", async () => {
      const response = await request
        .get('/api/v1/tasks/65b8060302c0c7f1643f3310')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('POST /api/v1/tasks should fail to create a task by missing the title', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_REQUIRED);
    });

    it('POST /api/v1/tasks should fail to create a task by title too short', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My',
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MIN_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by title too long', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task'.repeat(50),
          description: 'The new task for the day',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MAX_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by missing the description', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_REQUIRED);
    });

    it('POST /api/v1/tasks should fail to create a task by description too short', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
          description: 'The',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MIN_LENGTH);
    });

    it('POST /api/v1/tasks should fail to create a task by description too long', async () => {
      const response = await request
        .post('/api/v1/tasks')
        .send({
          title: 'My Brand New Task',
          description: 'The new task for the day'.repeat(100),
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MAX_LENGTH);
    });

    it('POST /api/v1/tasks should successfully create a task', async () => {
      const title = 'My Brand New Task';
      const description = 'The new task for the day';

      const response = await request
        .post('/api/v1/tasks')
        .send({ title, description })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual(title);
      expect(response.body.task.description).toEqual(description);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by not found', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .send({
          title: 'My Brand New Title',
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by title too short', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ title: 'New' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MIN_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by title too long', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ title: 'New Title'.repeat(80) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.TITLE_MAX_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by description too short', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ description: 'My' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MIN_LENGTH);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by description too long', async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ description: 'My New Description'.repeat(200) })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(TASK_MESSAGES.DESCRIPTION_MAX_LENGTH);
    });

    it("PATCH /api/v1/tasks/:taskId should fail to update another user's task", async () => {
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3312')
        .send({ description: 'My Brand New Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/tasks/:taskId should successfully update the task', async () => {
      const newTitle = 'The New Title';
      const response = await request
        .patch('/api/v1/tasks/65b8060302c0c7f1643f3313')
        .send({ title: newTitle })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual(newTitle);
    });

    it('DELETE /api/v1/tasks/:taskId should fail by not found', async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3a21')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual(TASK_MESSAGES.NOT_FOUND);
    });

    it('DELETE /api/v1/tasks/:taskId should successfully delete a task', async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3315')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.task).toBeTruthy();
      expect(response.body.task.title).toEqual('Task Number 6');
    });

    it("DELETE /api/v1/tasks/:taskId should fail to delete another user's task", async () => {
      const response = await request
        .delete('/api/v1/tasks/65b8060302c0c7f1643f3310')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.err).toEqual(FORBIDDEN_ERROR_MESSAGE);
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/tasks should fail to return a task by unauthorized', async () => {
      const response = await request.get('/api/v1/tasks');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('GET /api/v1/tasks/:taskId should fail to return a task by unauthorized', async () => {
      const response = await request.get('/api/v1/tasks/1');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('POST /api/v1/tasks should fail to create a task by unauthorized', async () => {
      const response = await request.post('/api/v1/tasks').send({});
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('PATCH /api/v1/tasks/:taskId should fail to update a task by unauthorized', async () => {
      const response = await request
        .patch('/api/v1/tasks/14')
        .send({ title: 'NewTask' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });

    it('DELETE /api/v1/tasks/:taskId should fail by unauthorized', async () => {
      const response = await request.delete('/api/v1/tasks/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.err).toEqual(UNAUTHORIZED_ERROR_MESSAGE);
    });
  });
});
