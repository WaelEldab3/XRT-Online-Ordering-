// Static Swagger configuration - no external libraries
export const specs = {
  openapi: '3.0.0',
  info: {
    title: 'XRT Customized System API',
    version: '1.0.0',
    description: 'Enterprise-grade API for authentication and user management',
  },
  servers: [
    {
      url: 'https://xrt-online-ordering.vercel.app/api/v1',
      description: 'Production',
    },
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Development',
    }
  ],
  paths: {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 8, example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  }
};

// Export empty swaggerUi since we're not using it
export const swaggerUi = null;
