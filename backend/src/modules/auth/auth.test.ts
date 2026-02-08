import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

// Integration test - No mocks.
describe("Auth", () => {
  const email = "jest_user@example.com";
  const username = "jest_user";
  const password = "Password123!";

  beforeAll(async () => {
    // cleanup if re-run
    // many: safe whether 0, 1, or more rows exist
    await prisma.refreshToken.deleteMany({
      where: { user: { email } },
    });
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email } },
    });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("signup -> sets refresh cookie", async () => {
    const res = await request(app).post("/api/auth/signup").send({ email, username, password });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.accessToken).toBeTruthy();
    const setCookie = Array.isArray(res.headers["set-cookie"])
        ? res.headers["set-cookie"].join(";")
        : res.headers["set-cookie"] ?? "";
    expect(setCookie).toContain("refreshToken=");
  });

  it("signin -> refresh -> logout", async () => {
    const agent = request.agent(app); // To remember cookies between requests

    const login = await agent.post("/api/auth/signin").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();

    const refresh = await agent.post("/api/auth/refresh");
    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeTruthy();

    const logout = await agent.post("/api/auth/logout");
    expect(logout.status).toBe(200);
    expect(logout.body.ok).toBe(true);
  });
});
