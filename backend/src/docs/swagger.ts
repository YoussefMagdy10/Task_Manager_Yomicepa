export const openapi = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
  },
  paths: {
    "/api/auth/signup": {
      post: {
        summary: "Create user and start session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "username", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  username: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Validation error" },
          "409": { description: "User already exists" },
        },
      },
    },
    "/api/auth/signin": {
      post: {
        summary: "Login and start session",
        responses: { "200": { description: "OK" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Rotate refresh token and issue new access token",
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout (revoke refresh token + clear cookie)",
        responses: { "200": { description: "OK" } },
      },
    },
  },
};
