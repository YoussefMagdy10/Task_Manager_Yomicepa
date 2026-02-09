# Task Manager API (Yomicepa Fullstack Coding Challenge)

Production-ready backend for a Task Manager where users can sign up/sign in and manage their personal tasks (CRUD).  
Built with TypeScript, Express, MySQL, Prisma, JWT auth, Zod validation, Swagger docs, and Jest + Supertest integration tests.

---

## Features

### Auth
- Signup / Signin
- JWT access token in `Authorization: Bearer <token>`
- Refresh token in **httpOnly cookie**
- Refresh token rotation with DB-backed sessions
- Logout revokes refresh session

### Tasks (all protected)
- Create task
- List my tasks (optional filter: `?completed=true|false`)
- Get task by id (owner-only; returns 404 if not found or not owned)
- Update task by id (partial PATCH; owner-only; 404 on not found/not owned)
- Delete task by id (owner-only; 404 on not found/not owned)

### Quality
- Controller / Service / Repository architecture
- Centralized error handling with `HttpError` + `errorHandler`
- Async route wrapper `asyncHandler`
- Validation via Zod
- Integration tests using real MySQL DB (Jest + Supertest)
- Swagger/OpenAPI docs at `/docs`

---

## Tech Stack

- Node.js + Express
- TypeScript (strict) with `exactOptionalPropertyTypes`
- MySQL (local)
- Prisma ORM (v6)
- JWT (access) + httpOnly cookie (refresh)
- bcrypt for password hashing
- Zod for validation
- Swagger UI for API docs
- Jest + Supertest for integration tests

---

## Prerequisites

- Node.js (LTS recommended)
- MySQL running locally
- A MySQL database created for the project

---

## Setup & Run

## In the backend directory:

1- Create a `.env` file at the project root and add the values described in the .env.example file in backend, replacing only the DATABASE_URL with your actual one.

2- Delete the migrations directory (if exists) in backend/prisma.

Then, 

1- Install dependencies:

npm install

2- Generate Prisma client: (If this command causes an error, make sure you deleted the migrations directory, then retry).

npx prisma generate

3- Run migrations:

npx prisma migrate dev

4- Start dev server

npm run dev


## In the frontend directory:

1- Install dependencies:

npm install

2- Start dev server

npm run dev
