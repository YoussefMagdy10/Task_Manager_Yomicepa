import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Tasks (core)", () => {
  const email = "jest_tasks_user@example.com";
  const username = "jest_tasks_user";
  const password = "Password123!";

  beforeAll(async () => {
    // cleanup (tasks -> refreshTokens -> user)
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
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ email, username, password });

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

    const listed = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(listed.status).toBe(200);
    expect(listed.body.ok).toBe(true);
    expect(Array.isArray(listed.body.tasks)).toBe(true);
    expect(listed.body.tasks.length).toBeGreaterThanOrEqual(1);

    const titles = listed.body.tasks.map((t: any) => t.title);
    expect(titles).toContain("First Task");
  });

  it("filter: completed=false", async () => {
    // signin to get access token (user already exists from previous test)
    const signin = await request(app).post("/api/auth/signin").send({ email, password });
    expect(signin.status).toBe(200);

    const accessToken = signin.body.accessToken;
    const res = await request(app)
      .get("/api/tasks?completed=false")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    for (const t of res.body.tasks) {
      expect(t.completed).toBe(false);
    }
  });
});
