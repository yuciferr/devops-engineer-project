import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../models/Task';
import { AppDataSource } from '../config/database';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dtos/task.dto';
import redisClient from '../config/redis';
import logger from '../utils/logger';

export class TaskService {
  private taskRepository: Repository<Task>;
  private readonly CACHE_TTL = 300; // 5 dakika

  constructor() {
    this.taskRepository = AppDataSource.getRepository(Task);
  }

  private async getCachedTasks(cacheKey: string): Promise<Task[] | null> {
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCachedTasks(cacheKey: string, tasks: Task[]): Promise<void> {
    await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(tasks));
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    await redisClient.del('tasks:all');
    logger.info('Yeni görev oluşturuldu', { taskId: task.id });
    return await this.taskRepository.save(task);
  }

  async getAllTasks(filterDto: TaskFilterDto): Promise<{ tasks: Task[]; total: number }> {
    const {
      status,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
      page = '1',
      limit = '10',
    } = filterDto;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const cacheKey = `tasks:${JSON.stringify(filterDto)}`;
    const cachedTasks = await this.getCachedTasks(cacheKey);

    if (cachedTasks) {
      logger.debug('Görevler önbellekten alındı');
      return { tasks: cachedTasks, total: cachedTasks.length };
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.isDeleted = :isDeleted', { isDeleted: false });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy(`task.${sortBy}`, order).skip(skip).take(limitNumber);

    const [tasks, total] = await queryBuilder.getManyAndCount();
    await this.setCachedTasks(cacheKey, tasks);

    logger.debug('Görevler veritabanından alındı', { total });
    return { tasks, total };
  }

  async getTaskById(id: string): Promise<Task | null> {
    const cacheKey = `task:${id}`;
    const cachedTask = await this.getCachedTasks(cacheKey);

    if (cachedTask) {
      logger.debug('Görev önbellekten alındı', { taskId: id });
      return cachedTask[0];
    }

    const task = await this.taskRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (task) {
      await this.setCachedTasks(cacheKey, [task]);
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    Object.assign(task, updateTaskDto);
    await redisClient.del(`task:${id}`);
    await redisClient.del('tasks:all');

    logger.info('Görev güncellendi', { taskId: id });
    return await this.taskRepository.save(task);
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = await this.getTaskById(id);
    if (!task) return false;

    task.isDeleted = true;
    await this.taskRepository.save(task);
    await redisClient.del(`task:${id}`);
    await redisClient.del('tasks:all');

    logger.info('Görev silindi', { taskId: id });
    return true;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    task.status = status;
    await redisClient.del(`task:${id}`);
    await redisClient.del('tasks:all');

    logger.info('Görev durumu güncellendi', { taskId: id, status });
    return await this.taskRepository.save(task);
  }
}
