import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma.js";
import app from "../src/app.js";
import { registerAndLogin } from "./helper.js";
import { generateShortCode } from "../src/utils/shortCode.js";

vi.mock("../src/utils/shortCode.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    generateShortCode: vi.fn(actual.generateShortCode),
  };
});

let validToken;
let validUserId;

beforeAll(async () => {
  const res = await registerAndLogin();
  validToken = res.token;
  validUserId = jwt.decode(validToken).userId;
});

beforeEach(async () => {
  vi.mocked(generateShortCode).mockReset();
  await prisma.link.deleteMany();
});

describe("POST /links/", () => {
  it("returns 201 when an authorized user provides a valid url which wasn't already shortened", async () => {
    //Arrange
    const payload = {
      originalUrl: "https://www.example.com",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("link");
    expect(res.body.link.originalUrl).toBe(payload.originalUrl);
    expect(res.body.link.ownerId).toBe(validUserId);
    expect(res.body).toHaveProperty("shortUrl");
    expect(res.body.shortUrl).toBe(
      `${process.env.APP_BASE_URL}/${res.body.link.shortCode}`,
    );
  });

  it("returns 201 when two different authorized users pass the same valid url to be shortened", async () => {
    //Arrange
    const { token: otherUserToken } = await registerAndLogin({
      email: "otheruser@mail.com",
      username: "OtherUser",
      password: "TestTest123!",
    });
    const payload = {
      originalUrl: "https://www.example.com",
    };
    const setupRes = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${otherUserToken}`);

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(setupRes.status).toBe(201);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("link");
    expect(res.body.link.originalUrl).toBe(payload.originalUrl);
    expect(res.body.link.ownerId).toBe(validUserId);
    expect(res.body).toHaveProperty("shortUrl");
    expect(res.body.shortUrl).toBe(
      `${process.env.APP_BASE_URL}/${res.body.link.shortCode}`,
    );
  });

  it("returns 400 when an authorized user provides an invalid url", async () => {
    //Arrange
    const payload = {
      originalUrl: "file:///C:/folder/file.txt",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid url provided.");
  });

  it("returns 409 when an authorized user provides an url which was already shortened", async () => {
    //Arrange
    const payload = {
      originalUrl: "https://www.example.com",
    };
    await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Provided link has already been shortened.");
  });

  it("returns 401 when an unauthorized user provieds an url to be shortened", async () => {
    //Arrange
    const payload = {
      originalUrl: "https://www.example.com",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${"invalidToken"}`);

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Unauthorized");
  });

  it("returns 401 when user provieds an url to be shortened without an authorization header", async () => {
    //Arrange
    const payload = {
      originalUrl: "https://www.example.com",
    };

    //Act
    const res = await request(app).post("/links/").send(payload);

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("No token provided.");
  });
});

describe("POST /links/ short code retry logic", () => {
  const TAKEN_CODE = "takenCd";

  beforeEach(async () => {
    await prisma.link.create({
      data: {
        originalUrl: "https://www.already-taken.com",
        shortCode: TAKEN_CODE,
        ownerId: validUserId,
      },
    });
  });

  it("returns 201 when the first short code collides but the second one is free", async () => {
    //Arrange
    vi.mocked(generateShortCode)
      .mockReturnValueOnce(TAKEN_CODE)
      .mockReturnValueOnce("freshCd");

    const payload = {
      originalUrl: "https://www.example.com",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(201);
    expect(res.body.link.shortCode).toBe("freshCd");
    expect(res.body.shortUrl).toBe(`${process.env.APP_BASE_URL}/freshCd`);
    expect(generateShortCode).toHaveBeenCalledTimes(2);
  });

  it("returns 500 when all three short codes collide", async () => {
    //Arrange
    vi.mocked(generateShortCode).mockReturnValue(TAKEN_CODE);

    const payload = {
      originalUrl: "https://www.example.com",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(500);
    expect(res.body.message).toBe(
      "Could not generate a unique short code. Please try again.",
    );
    expect(generateShortCode).toHaveBeenCalledTimes(3);
    expect(await prisma.link.count()).toBe(1);
  });

  it("returns 409 without retrying when the collision is on (ownerId, originalUrl)", async () => {
    //Arrange
    const payload = {
      originalUrl: "https://www.already-taken.com",
    };

    //Act
    const res = await request(app)
      .post("/links/")
      .send(payload)
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Provided link has already been shortened.");
    expect(generateShortCode).toHaveBeenCalledTimes(1);
  });
});

// describe("GET /links/", () => {});

// describe("GET /links/:id", () => {});

// describe("PATCH /links/:id", () => {});

// describe("DELETE /links/:id", () => {});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
