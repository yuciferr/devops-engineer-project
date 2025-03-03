import { IsString, IsOptional, IsEnum, Length, IsIn } from 'class-validator';
import { TaskStatus } from '../models/Task';

export class CreateTaskDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'title', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
} 