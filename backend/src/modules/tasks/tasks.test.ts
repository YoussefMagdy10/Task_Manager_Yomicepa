import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Tasks (core)", () => {
  const email = "jest_tasks_user@example.com";
  const username = "jest_tasks_user";
  const password = "Password123!";

  beforeAll(async () => {
    await prisma.task.deleteMany({ where: { user: { email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { user: { email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("401 when no token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it("create task + list my tasks", async () => {
    const signup = await request(app).post("/api/auth/signup").send({ email, username, password });

    expect(signup.status).toBe(201);
    const accessToken = signup.body.accessToken;
    expect(accessToken).toBeTruthy();

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "First Task", description: "Hello" });

    expect(created.status).toBe(201);
    expect(created.body.ok).toBe(true);
    expect(created.body.task.title).toBe("First Task");
    expect(created.body.task.completed).toBe(false);

    const listed = await request(app).get("/api/tasks").set("Authorization", `Bearer ${accessToken}`);

    expect(listed.status).toBe(200);
    expect(listed.body.ok).toBe(true);
    expect(Array.isArray(listed.body.tasks)).toBe(true);
    expect(listed.body.tasks.length).toBeGreaterThanOrEqual(1);

    const titles = listed.body.tasks.map((t: any) => t.title);
    expect(titles).toContain("First Task");
  });

  it("filter: completed=false", async () => {
    const signin = await request(app).post("/api/auth/signin").send({ email, password });
    expect(signin.status).toBe(200);

    const accessToken = signin.body.accessToken;
    const res = await request(app).get("/api/tasks?completed=false").set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    for (const t of res.body.tasks) {
      expect(t.completed).toBe(false);
    }
  });
});

describe("Tasks (CRUD + ownership)", () => {
  const a = { email: "jest_tasks_a@example.com", username: "jest_tasks_a", password: "Password123!" };
  const b = { email: "jest_tasks_b@example.com", username: "jest_tasks_b", password: "Password123!" };

  let tokenA = "";
  let tokenB = "";
  let taskId = "";

  beforeAll(async () => {
    // cleanup
    await prisma.task.deleteMany({ where: { user: { email: { in: [a.email, b.email] } } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { in: [a.email, b.email] } } } });
    await prisma.user.deleteMany({ where: { email: { in: [a.email, b.email] } } });

    const signupA = await request(app).post("/api/auth/signup").send(a);
    expect(signupA.status).toBe(201);
    tokenA = signupA.body.accessToken;

    const signupB = await request(app).post("/api/auth/signup").send(b);
    expect(signupB.status).toBe(201);
    tokenB = signupB.body.accessToken;

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "A Task", description: "Owned by A" });

    expect(created.status).toBe(201);
    taskId = created.body.task.id;
    expect(taskId).toBeTruthy();
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { user: { email: { in: [a.email, b.email] } } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { in: [a.email, b.email] } } } });
    await prisma.user.deleteMany({ where: { email: { in: [a.email, b.email] } } });
  });

  it("GET /api/tasks/:id returns my task", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.task.id).toBe(taskId);
    expect(res.body.task.title).toBe("A Task");
  });

  it("GET /api/tasks/:id as other user => 404", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it("PATCH /api/tasks/:id updates my task", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "A Task Updated", completed: true });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.task.title).toBe("A Task Updated");
    expect(res.body.task.completed).toBe(true);
  });

  it("PATCH /api/tasks/:id as other user => 404", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hacked" });

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it("DELETE /api/tasks/:id as other user => 404", async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it("DELETE /api/tasks/:id deletes my task", async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const after = await request(app).get(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${tokenA}`);
    expect(after.status).toBe(404);
  });
});
