import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { TaskStatus } from '../models/Task';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create task', error });
    }
  }

  async getAllTasks(_req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks', error });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.getTaskById(req.params.id);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task', error });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update task', error });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.taskService.deleteTask(req.params.id);
      if (!success) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task', error });
    }
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!Object.values(TaskStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      const task = await this.taskService.updateTaskStatus(req.params.id, status);
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update task status', error });
    }
  }
}
