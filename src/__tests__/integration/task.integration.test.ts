import request from 'supertest';
import { AppDataSource } from '../../config/database';
import app from '../../app';
import { Task, TaskStatus } from '../../models/Task';

describe('Task Integration Tests', () => {
  let taskRepository: any;

  beforeAll(async () => {
    await AppDataSource.initialize();
    taskRepository = AppDataSource.getRepository(Task);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await taskRepository.clear();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(TaskStatus.TODO);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((t: Task) => t.id === task.id)).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const response = await request(app).get(`/api/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(task.id);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should soft delete a task', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const response = await request(app).delete(`/api/tasks/${task.id}`);
      expect(response.status).toBe(204);

      const deletedTask = await taskRepository.findOne({
        where: { id: task.id }
      });
      expect(deletedTask.isDeleted).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should return 400 for invalid status', async () => {
      const task = await taskRepository.save({
        title: 'Test Task',
        description: 'Test Description'
      });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
    });
  });
}); 