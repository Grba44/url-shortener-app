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

describe("GET /links/", () => {
  const createLink = (overrides = {}) =>
    prisma.link.create({
      data: {
        originalUrl: "https://www.example.com",
        shortCode: generateShortCode(),
        ownerId: validUserId,
        ...overrides,
      },
    });

  it("returns 200 and an empty array when the user has no links", async () => {
    //Act
    const res = await request(app)
      .get("/links/")
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(200);
    expect(res.body.links).toEqual([]);
  });

  it("returns 200 and only the links owned by the authorized user", async () => {
    //Arrange
    const { token: otherUserToken } = await registerAndLogin({
      email: "otheruser@mail.com",
      username: "OtherUser",
      password: "TestTest123!",
    });
    const otherUserId = jwt.decode(otherUserToken).userId;

    const ownLink = await createLink({ originalUrl: "https://www.mine.com" });
    await createLink({
      originalUrl: "https://www.not-mine.com",
      ownerId: otherUserId,
    });

    //Act
    const res = await request(app)
      .get("/links/")
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(200);
    expect(res.body.links).toHaveLength(1);
    expect(res.body.links[0].id).toBe(ownLink.id);
    expect(res.body.links[0].originalUrl).toBe("https://www.mine.com");
  });

  it("returns each link with its shortUrl and without ownerId", async () => {
    //Arrange
    const link = await createLink();

    //Act
    const res = await request(app)
      .get("/links/")
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(200);
    expect(res.body.links[0].shortCode).toBe(link.shortCode);
    expect(res.body.links[0].shortUrl).toBe(
      `${process.env.APP_BASE_URL}/${link.shortCode}`,
    );
    expect(res.body.links[0]).not.toHaveProperty("ownerId");
  });

  it("returns links ordered from newest to oldest", async () => {
    //Arrange
    // Explicit createdAt so the order doesn't depend on insert timing
    await createLink({
      originalUrl: "https://www.oldest.com",
      createdAt: new Date("2026-01-01"),
    });
    await createLink({
      originalUrl: "https://www.newest.com",
      createdAt: new Date("2026-03-01"),
    });
    await createLink({
      originalUrl: "https://www.middle.com",
      createdAt: new Date("2026-02-01"),
    });

    //Act
    const res = await request(app)
      .get("/links/")
      .set("Authorization", `Bearer ${validToken}`);

    //Assert
    expect(res.status).toBe(200);
    expect(res.body.links.map((link) => link.originalUrl)).toEqual([
      "https://www.newest.com",
      "https://www.middle.com",
      "https://www.oldest.com",
    ]);
  });

  it.each([
    ["an invalid token", "Bearer invalidToken", "Unauthorized"],
    ["no authorization header", undefined, "No token provided."],
  ])("returns 401 when the request has %s", async (_, header, message) => {
    //Arrange
    const req = request(app).get("/links/");
    if (header) req.set("Authorization", header);

    //Act
    const res = await req;

    //Assert
    expect(res.status).toBe(401);
    expect(res.body.message).toBe(message);
  });
});

// describe("GET /links/:id", () => {});

// describe("PATCH /links/:id", () => {});

// describe("DELETE /links/:id", () => {});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
