import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tazkiyah API',
      version: '1.0.0',
      description: 'REST API for Tazkiyah - Islamic Habit Tracker',
      contact: {
        name: 'Tazkiyah Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            theme: { type: 'string', enum: ['dark', 'light', 'system'] },
            timezone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Habit: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            label: { type: 'string' },
            icon: { type: 'string' },
            description: { type: 'string' },
            targetMinutes: { type: 'number', nullable: true },
            sortOrder: { type: 'number' },
          },
        },
        HabitRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            habitId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['completed', 'skipped', 'pending'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            notes: { type: 'string', nullable: true },
            skipReason: { type: 'string', nullable: true },
            durationMinutes: { type: 'number', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Account created successfully' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    rememberMe: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Logged in successfully' } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout user',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Logged out' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'User profile' } },
        },
      },
      '/auth/change-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Password changed' } },
        },
      },
      '/habits': {
        get: {
          tags: ['Habits'],
          summary: 'Get all habits',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'List of habits' } },
        },
      },
      '/records/today': {
        get: {
          tags: ['Records'],
          summary: 'Get today\'s records',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Today\'s data' } },
        },
      },
      '/records/history': {
        get: {
          tags: ['Records'],
          summary: 'Get paginated history',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
            { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Paginated records' } },
        },
      },
      '/records/weekly-report': {
        get: {
          tags: ['Records'],
          summary: 'Get weekly report',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'startDate', required: true, schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'endDate', required: true, schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Weekly report' } },
        },
      },
      '/records/analytics/{year}/{month}': {
        get: {
          tags: ['Records'],
          summary: 'Get monthly analytics',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'year', required: true, schema: { type: 'integer' } },
            { in: 'path', name: 'month', required: true, schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'Monthly analytics' } },
        },
      },
      '/records/day/{date}': {
        get: {
          tags: ['Records'],
          summary: 'Get day details',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'date', required: true, schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Day details' } },
        },
      },
      '/records': {
        post: {
          tags: ['Records'],
          summary: 'Create or update habit record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['habitId', 'date', 'status'],
                  properties: {
                    habitId: { type: 'string', format: 'uuid' },
                    date: { type: 'string', format: 'date' },
                    status: { type: 'string', enum: ['completed', 'skipped'] },
                    notes: { type: 'string' },
                    skipReason: { type: 'string' },
                    durationMinutes: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Record created' } },
        },
      },
      '/records/{id}': {
        patch: {
          tags: ['Records'],
          summary: 'Update habit record',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Record updated' } },
        },
      },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
