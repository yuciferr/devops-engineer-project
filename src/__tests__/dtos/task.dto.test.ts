import { validate } from 'class-validator';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../../dtos/task.dto';
import { TaskStatus } from '../../models/Task';

describe('Task DTOs', () => {
  describe('CreateTaskDto', () => {
    it('should validate a valid create task DTO', async () => {
      const dto = new CreateTaskDto();
      dto.title = 'Test Task';
      dto.description = 'Test Description';
      dto.status = TaskStatus.TODO;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for empty title', async () => {
      const dto = new CreateTaskDto();
      dto.title = '';
      dto.description = 'Test Description';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should allow missing description', async () => {
      const dto = new CreateTaskDto();
      dto.title = 'Test Task';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateTaskDto', () => {
    it('should validate a valid update task DTO', async () => {
      const dto = new UpdateTaskDto();
      dto.title = 'Updated Task';
      dto.description = 'Updated Description';
      dto.status = TaskStatus.IN_PROGRESS;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow partial updates', async () => {
      const dto = new UpdateTaskDto();
      dto.title = 'Updated Task';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('TaskFilterDto', () => {
    it('should validate valid filter parameters', async () => {
      const dto = new TaskFilterDto();
      dto.status = TaskStatus.TODO;
      dto.search = 'test';
      dto.sortBy = 'createdAt';
      dto.order = 'DESC';
      dto.page = '1';
      dto.limit = '10';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail for invalid sort field', async () => {
      const dto = new TaskFilterDto();
      dto.sortBy = 'invalidField';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sortBy');
    });

    it('should fail for invalid order value', async () => {
      const dto = new TaskFilterDto();
      dto.order = 'INVALID' as 'ASC' | 'DESC';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('order');
    });
  });
}); 