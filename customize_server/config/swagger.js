import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XRT Customized System API',
      version: '1.0.0',
      description: 'Enterprise-grade API for authentication, user management, and role-based access control',
      contact: {
        name: 'Development Team',
        email: 'dev@xrt.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development environment'
      },
      {
        url: 'https://xrt-online-ordering.vercel.app/api/v1',
        description: 'Production server'
      }
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
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'super_admin'],
              description: 'User role'
            },
            isApproved: {
              type: 'boolean',
              description: 'Whether user is approved'
            },
            isBanned: {
              type: 'boolean',
              description: 'Whether user is banned'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'confirmPassword'],
          properties: {
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (min 8 characters)'
            },
            confirmPassword: {
              type: 'string',
              description: 'Confirm password'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Role ID'
            },
            name: {
              type: 'string',
              description: 'Role name'
            },
            displayName: {
              type: 'string',
              description: 'Human-readable role name'
            },
            description: {
              type: 'string',
              description: 'Role description'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of permissions'
            }
          }
        },
        CreateRoleRequest: {
          type: 'object',
          required: ['name', 'displayName'],
          properties: {
            name: {
              type: 'string',
              description: 'Unique role identifier'
            },
            displayName: {
              type: 'string',
              description: 'Human-readable role name'
            },
            description: {
              type: 'string',
              description: 'Role description'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of permissions for this role'
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    },
  },
  apis: ['./controllers/*.js'], // Only scan controllers for now
};

let specs;

try {
  console.log('Generating Swagger specifications...');
  specs = swaggerJsdoc(options);
  console.log('Swagger specifications generated successfully');
  console.log('Available endpoints:', Object.keys(specs.paths || {}));
} catch (error) {
  console.error('Error generating Swagger specs:', error);
  console.error('Error details:', error.stack);
  // Create a minimal fallback spec
  specs = {
    openapi: '3.0.0',
    info: {
      title: 'XRT Customized System API',
      version: '1.0.0',
      description: 'Enterprise-grade API (Limited documentation due to parsing error)'
    },
    paths: {}
  };
}

export { swaggerUi, specs };
