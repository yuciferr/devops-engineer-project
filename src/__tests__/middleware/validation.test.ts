import { Request, Response, NextFunction } from 'express';
import { validateDto } from '../../middleware/validation';
import { CreateTaskDto } from '../../dtos/task.dto';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should pass validation for valid data', async () => {
    mockRequest.body = {
      title: 'Test Task',
      description: 'Test Description',
    };

    const middleware = validateDto(CreateTaskDto);
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should fail validation for invalid data', async () => {
    mockRequest.body = {
      title: '', // Boş başlık geçersizdir
      description: 'Test Description',
    };

    const middleware = validateDto(CreateTaskDto);
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
      })
    );
  });
});
