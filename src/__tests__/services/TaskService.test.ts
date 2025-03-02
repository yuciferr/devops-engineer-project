import { TaskService } from '../../services/TaskService';
import { TaskStatus } from '../../models/Task';
import { AppDataSource } from '../../config/database';
import redisClient from '../../config/redis';
import { Repository } from 'typeorm';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock('../../config/redis', () => ({
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn()
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn()
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockRepository: Repository<any>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn()
    } as unknown as Repository<any>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    taskService = new TaskService();
  });

  describe('createTask', () => {
    it('should create task and invalidate cache', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const savedTask = { id: '1', ...taskData };
      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);

      const result = await taskService.createTask(taskData);

      expect(result).toEqual(savedTask);
      expect(redisClient.del).toHaveBeenCalledWith('tasks:all');
    });
  });

  describe('getAllTasks with caching', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' }
    ];

    it('should return cached tasks if available', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockTasks));

      const result = await taskService.getAllTasks({});

      expect(result.tasks).toEqual(mockTasks);
      expect(redisClient.get).toHaveBeenCalled();
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if no cache exists', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTasks, mockTasks.length])
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await taskService.getAllTasks({});

      expect(result.tasks).toEqual(mockTasks);
      expect(redisClient.setex).toHaveBeenCalled();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update status and invalidate cache', async () => {
      const taskId = '1';
      const task = {
        id: taskId,
        title: 'Test Task',
        status: TaskStatus.TODO
      };
      const updatedTask = { ...task, status: TaskStatus.IN_PROGRESS };

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await taskService.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);

      expect(result).toEqual(updatedTask);
      expect(redisClient.del).toHaveBeenCalledWith(`task:${taskId}`);
      expect(redisClient.del).toHaveBeenCalledWith('tasks:all');
    });
  });
}); 