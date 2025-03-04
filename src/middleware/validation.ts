import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassConstructor } from 'class-transformer';
import logger from '../utils/logger';

export const validateDto = <T extends object>(dtoClass: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dtoObject = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      logger.warn('Validation error', { errors });
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
      return;
    }

    req.body = dtoObject;
    next();
  };
};
