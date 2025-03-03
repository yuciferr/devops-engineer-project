import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { TaskStatus } from '../models/Task';
import { TaskFilterDto } from '../dtos/task.dto';
import logger from '../utils/logger';

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
      logger.error('Görev oluşturma hatası', { error });
      res.status(400).json({ message: 'Görev oluşturulamadı', error });
    }
  }

  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const filterDto: TaskFilterDto = {
        status: req.query.status as TaskStatus,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        order: req.query.order as 'ASC' | 'DESC',
        page: req.query.page as string,
        limit: req.query.limit as string,
      };

      const { tasks, total } = await this.taskService.getAllTasks(filterDto);

      res.header('X-Total-Count', total.toString());
      res.json({
        data: tasks,
        meta: {
          total,
          page: parseInt(filterDto.page || '1'),
          limit: parseInt(filterDto.limit || '10'),
        },
      });
    } catch (error) {
      logger.error('Görevleri getirme hatası', { error });
      res.status(500).json({ message: 'Görevler getirilemedi', error });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.getTaskById(req.params.id);
      if (!task) {
        res.status(404).json({ message: 'Görev bulunamadı' });
        return;
      }
      res.json(task);
    } catch (error) {
      logger.error('Görev getirme hatası', { error, taskId: req.params.id });
      res.status(500).json({ message: 'Görev getirilemedi', error });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      if (!task) {
        res.status(404).json({ message: 'Görev bulunamadı' });
        return;
      }
      res.json(task);
    } catch (error) {
      logger.error('Görev güncelleme hatası', { error, taskId: req.params.id });
      res.status(400).json({ message: 'Görev güncellenemedi', error });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.taskService.deleteTask(req.params.id);
      if (!success) {
        res.status(404).json({ message: 'Görev bulunamadı' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      logger.error('Görev silme hatası', { error, taskId: req.params.id });
      res.status(500).json({ message: 'Görev silinemedi', error });
    }
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!Object.values(TaskStatus).includes(status)) {
        res.status(400).json({ message: 'Geçersiz durum' });
        return;
      }

      const task = await this.taskService.updateTaskStatus(req.params.id, status);
      if (!task) {
        res.status(404).json({ message: 'Görev bulunamadı' });
        return;
      }
      res.json(task);
    } catch (error) {
      logger.error('Görev durumu güncelleme hatası', { error, taskId: req.params.id });
      res.status(400).json({ message: 'Görev durumu güncellenemedi', error });
    }
  }
}
