import { vi, it, beforeEach, afterAll, expect, afterEach } from "vitest";
import { registerUser } from "./helper.js";
import { prisma } from "../src/lib/prisma.js";
import request from "supertest";
import app from "../src/app.js";
import { _resetRateLimiter } from "../src/middleware/rateLimiter.js";

beforeEach(async () => {
  await prisma.user.deleteMany();
  _resetRateLimiter();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("returns 429 when captcha verification fails after too many login attempts", async () => {
  // Arrange: make 4 unsuccessful attempts to build the counter
  const { email } = await registerUser();
  for (let i = 0; i < 4; i++) {
    await request(app)
      .post("/auth/login")
      .send({ email, password: "PogresnaSifra1!" });
  }
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    json: async () => ({ success: false }),
  });

  // Act
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "PogresnaSifra1!", captchaToken: "bilo-sta" });

  // Assert
  expect(res.status).toBe(429);
  expect(res.body.message).toBe("Failed captcha verification.");
});

it("returns 200 and token when captcha verification passed after too many login attempts", async () => {
  //Arrange
  const { email, password } = await registerUser();
  for (let i = 0; i < 4; i++) {
    await request(app)
      .post("/auth/login")
      .send({ email, password: "PogresnaSifra1!" });
  }
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    json: async () => ({ success: true }),
  });

  //Act
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password, captchaToken: "token" });

  //Assert
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("token");
});

it("returns 200 and token when the captcha service is unreachable (fails open)", async () => {
  //Arrange
  const { email, password } = await registerUser();
  for (let i = 0; i < 4; i++) {
    await request(app)
      .post("/auth/login")
      .send({ email, password: "PogresnaSifra1!" });
  }
  vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
    new Error("network down"),
  );

  //Act
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password, captchaToken: "token" });

  //Assert
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("token");
});

it("returns 429 when the captcha service returns a malformed response", async () => {
  //Arrange
  const { email, password } = await registerUser();
  for (let i = 0; i < 4; i++) {
    await request(app)
      .post("/auth/login")
      .send({ email, password: "PogresnaSifra1!" });
  }
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    json: async () => ({ success: undefined }),
  });

  //Act
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password, captchaToken: "token" });

  //Assert
  expect(res.status).toBe(429);
  expect(res.body.message).toBe("Failed captcha verification.");
});

afterAll(async () => {
  await prisma.$disconnect();
});
