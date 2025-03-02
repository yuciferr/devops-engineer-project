import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../models/Task';
import { AppDataSource } from '../config/database';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';

export class TaskService {
  private taskRepository: Repository<Task>;

  constructor() {
    this.taskRepository = AppDataSource.getRepository(Task);
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(task);
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id, isDeleted: false }
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = await this.getTaskById(id);
    if (!task) return false;

    task.isDeleted = true;
    await this.taskRepository.save(task);
    return true;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    task.status = status;
    return await this.taskRepository.save(task);
  }
}
