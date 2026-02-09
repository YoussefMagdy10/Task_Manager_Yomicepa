import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Me (protected)", () => {
  const email = "jest_me_user@example.com";
  const username = "jest_me_user";
  const password = "Password123!";

  beforeAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("GET /api/me -> 401 without token", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("MISSING_ACCESS_TOKEN");
  });

  it("GET /api/me -> 200 with token", async () => {
    // signup (creates user + returns access token)
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ email, username, password });

    expect(signup.status).toBe(201);
    const accessToken = signup.body.accessToken;
    expect(accessToken).toBeTruthy();

    const me = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.ok).toBe(true);
    expect(me.body.user.email).toBe(email);
    expect(me.body.user.username).toBe(username);
    expect(me.body.user.id).toBeTruthy();
  });
});
