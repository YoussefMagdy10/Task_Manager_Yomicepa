export const openapi = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      // ---------- Common ----------
      ErrorResponse: {
        type: "object",
        required: ["ok", "error"],
        properties: {
          ok: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["code"],
            properties: {
              code: { type: "string", example: "UNAUTHORIZED" },
              message: { type: "string", example: "Missing Bearer token" },
              details: { type: "object" },
            },
            additionalProperties: true,
          },
        },
      },

      ValidationErrorResponse: {
        type: "object",
        required: ["ok", "error"],
        properties: {
          ok: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["code", "details"],
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              details: { type: "object" },
            },
          },
        },
      },

      // ---------- Auth ----------
      SignupRequest: {
        type: "object",
        required: ["email", "username", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          username: { type: "string", example: "john_doe" },
          password: { type: "string", minLength: 8, example: "Password123!" },
        },
      },

      SigninRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "Password123!" },
        },
      },

      AuthSuccessResponse: {
        type: "object",
        required: ["ok", "accessToken"],
        properties: {
          ok: { type: "boolean", example: true },
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },

      OkResponse: {
        type: "object",
        required: ["ok"],
        properties: { ok: { type: "boolean", example: true } },
      },

      // ---------- Me ----------
      Me: {
        type: "object",
        required: ["id", "email", "username"],
        properties: {
          id: { type: "string", example: "ckx9f0q4d0000v8l2b9nqv2r1" },
          email: { type: "string", format: "email", example: "user@example.com" },
          username: { type: "string", example: "john_doe" },
        },
      },

      MeResponse: {
        type: "object",
        required: ["ok", "user"],
        properties: {
          ok: { type: "boolean", example: true },
          user: { $ref: "#/components/schemas/Me" },
        },
      },

      // ---------- Tasks ----------
      Task: {
        type: "object",
        required: ["id", "userId", "title", "completed", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "cuid", example: "ckx9f0q4d0000v8l2b9nqv2r1" },
          userId: { type: "string", example: "ckx9ezm1n0000v8l2j7q0a8v2" },
          title: { type: "string", example: "Buy groceries" },
          description: { type: "string", nullable: true, example: "Milk, eggs, bread" },
          completed: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time", example: "2026-02-09T08:00:00.000Z" },
          updatedAt: { type: "string", format: "date-time", example: "2026-02-09T08:00:00.000Z" },
        },
      },

      CreateTaskRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200, example: "Buy groceries" },
          description: { type: "string", maxLength: 5000, example: "Milk, eggs, bread" },
        },
      },

      UpdateTaskRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200, example: "Buy groceries (updated)" },
          description: { type: "string", maxLength: 5000, example: "Milk, eggs, bread, cheese" },
          completed: { type: "boolean", example: true },
        },
      },

      TaskResponse: {
        type: "object",
        required: ["ok", "task"],
        properties: {
          ok: { type: "boolean", example: true },
          task: { $ref: "#/components/schemas/Task" },
        },
      },

      TasksResponse: {
        type: "object",
        required: ["ok", "tasks"],
        properties: {
          ok: { type: "boolean", example: true },
          tasks: {
            type: "array",
            items: { $ref: "#/components/schemas/Task" },
          },
        },
      },
    },

    responses: {
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              missingToken: {
                value: { ok: false, error: { code: "MISSING_ACCESS_TOKEN", message: "Missing Bearer token" } },
              },
              expired: {
                value: { ok: false, error: { code: "ACCESS_TOKEN_EXPIRED", message: "Access token expired" } },
              },
              invalid: {
                value: { ok: false, error: { code: "INVALID_ACCESS_TOKEN", message: "Invalid access token" } },
              },
            },
          },
        },
      },

      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
          },
        },
      },

      NotFound: {
        description: "Not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              taskNotFound: { value: { ok: false, error: { code: "TASK_NOT_FOUND" } } },
            },
          },
        },
      },

      Conflict: {
        description: "Conflict",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              alreadyExists: { value: { ok: false, error: { code: "USER_ALREADY_EXISTS" } } },
            },
          },
        },
      },
    },
  },

  paths: {
    "/api/auth/signup": {
      post: {
        summary: "Create user and start session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
              examples: {
                example: {
                  value: { email: "user@example.com", username: "john_doe", password: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    "/api/auth/signin": {
      post: {
        summary: "Login and start session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SigninRequest" },
              examples: {
                example: {
                  value: { email: "user@example.com", password: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/api/auth/refresh": {
      post: {
        summary: "Rotate refresh token and issue new access token",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        summary: "Logout (revoke refresh token + clear cookie)",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/OkResponse" } },
            },
          },
        },
      },
    },

    "/api/me": {
      get: {
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MeResponse" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/api/tasks": {
      get: {
        summary: "List my tasks",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "completed",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TasksResponse" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "400": { $ref: "#/components/responses/ValidationError" },
        },
      },

      post: {
        summary: "Create a task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTaskRequest" },
              examples: {
                example: { value: { title: "Buy groceries", description: "Milk, eggs, bread" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "400": { $ref: "#/components/responses/ValidationError" },
        },
      },
    },

    "/api/tasks/{id}": {
      get: {
        summary: "Get my task by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "cuid" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      patch: {
        summary: "Update my task by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "cuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskRequest" },
              examples: {
                markDone: { value: { completed: true } },
                updateText: { value: { title: "Buy groceries (updated)", description: "Add cheese" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/TaskResponse" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },

      delete: {
        summary: "Delete my task by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "cuid" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/OkResponse" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
};
