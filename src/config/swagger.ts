import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Task Management API',
    description: 'Task Management API with Express.js, PostgreSQL, and Redis',
    version: '1.0.0',
  },
  host: `localhost:${process.env.PORT || 3000}`,
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  definitions: {
    Task: {
      id: 'string',
      title: 'string',
      description: 'string',
      status: 'TODO | IN_PROGRESS | DONE',
      isDeleted: 'boolean',
      createdAt: 'string',
      updatedAt: 'string',
    },
    CreateTaskDto: {
      title: 'string',
      description: 'string',
      status: 'TODO | IN_PROGRESS | DONE',
    },
    UpdateTaskDto: {
      title: 'string',
      description: 'string',
      status: 'TODO | IN_PROGRESS | DONE',
    },
    TaskFilterDto: {
      status: 'TODO | IN_PROGRESS | DONE',
      search: 'string',
      sortBy: 'createdAt | title | status',
      order: 'ASC | DESC',
      page: 'string',
      limit: 'string',
    },
  },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/app.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc); 