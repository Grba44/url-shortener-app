import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma.js";
import app from "../src/app.js";
import { registerAndLogin, registerUser } from "./helper.js";
import { signToken } from "../src/utils/token.js";

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.revokedToken.deleteMany();
});

describe("POST /auth/signup", () => {
  it("returns 201 and a token for valid signup data", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    const res = await request(app).post("/auth/signup").send(payload);

    //Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it.each([
    { missingField: "email" },
    { missingField: "username" },
    { missingField: "password" },
  ])(
    "returns 400 and invalid credentials message when $missingField is not provided",
    async ({ missingField }) => {
      //Arrange
      const payload = {
        email: "user@example.com",
        username: "TestUser",
        password: "Mv1!Mv1!",
      };
      delete payload[missingField];

      //Act
      const res = await request(app).post("/auth/signup").send(payload);

      //Assert
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Invalid credentials.");
    },
  );

  it("returns 400 and invalid email message when email is not valid", async () => {
    //Arrange
    const payload = {
      email: "userexample.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    const res = await request(app).post("/auth/signup").send(payload);

    //Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid email.");
  });

  it("returns 400 and invalid password message when password is not valid", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1",
    };

    //Act
    const res = await request(app).post("/auth/signup").send(payload);

    //Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid password.");
  });

  it("returns 400 and invalid username message when username is not valid", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: " ",
      password: "Mv1!Mv1!",
    };

    //Act
    const res = await request(app).post("/auth/signup").send(payload);

    //Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid username.");
  });

  it("returns 409 when user with provided email already exists", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    await request(app).post("/auth/signup").send(payload);
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...payload, username: "SecondUser" });

    //Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(
      "User with provided email or username already exists.",
    );
  });

  it("returns 409 when user with provided username already exists", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    await request(app).post("/auth/signup").send(payload);
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...payload, email: "other@example.com" });

    //Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(
      "User with provided email or username already exists.",
    );
  });

  it("returns 409 when username already exists in a different case", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    await request(app).post("/auth/signup").send(payload);
    const res = await request(app).post("/auth/signup").send({
      ...payload,
      email: "other@example.com",
      username: "testuser",
    });

    //Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe(
      "User with provided email or username already exists.",
    );
  });

  it("preserves the casing the user signed up with", async () => {
    //Arrange
    const payload = {
      email: "user@example.com",
      username: "TestUser",
      password: "Mv1!Mv1!",
    };

    //Act
    const signupRes = await request(app).post("/auth/signup").send(payload);
    const meRes = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${signupRes.body.token}`);

    //Assert
    expect(meRes.body.user.username).toBe("TestUser");
  });
});

describe("POST /auth/login", () => {
  it("returns 200 and a token for valid login", async () => {
    //Arrange
    const { email, password } = await registerUser();

    //Act
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password });

    //Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it.each([{ missingField: "email" }, { missingField: "password" }])(
    "returns 400 and invalid credentials message when $missingField is not provided",
    async ({ missingField }) => {
      //Arrange
      const payload = {
        email: "test@mail.com",
        password: "ThisIsATest123!",
      };
      delete payload[missingField];

      //Act
      const res = await request(app).post("/auth/login").send(payload);

      //Assert
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Invalid credentials.");
    },
  );

  it("returns 400 and invalid email message when invalid email provided", async () => {
    //Arrange
    const payload = {
      email: "testmail.com",
      password: "ThisIsATest123!",
    };

    //Act
    const res = await request(app).post("/auth/login").send(payload);

    //Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid email.");
  });

  it("returns 401 and invalid credentials message when user with provided email does not exist", async () => {
    //Arrange
    const { password } = await registerUser();

    //Act
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "pogresan@mail.com", password });

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid credentials.");
  });

  it("returns 401 and invalid credentials message when incorrect password provided for the user", async () => {
    //Arrange
    const { email } = await registerUser();

    //Act
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password: "NetacnaSifra123!" });

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid credentials.");
  });
});

describe("GET /auth/me", () => {
  it("returns 200 and user information when user exists and a valid token provided", async () => {
    //Arrange
    const { email, username, token } = await registerAndLogin();

    //Act
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    //Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.username).toBe(username);
  });

  it("returns 401 when authorization header not provided", async () => {
    //Arrange

    //Act
    const res = await request(app).get("/auth/me");

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("No token provided.");
  });

  it("returns 401 when incorrect token provided in authorization header", async () => {
    //Arrange
    const token = "incorrect token bearer string";

    //Act
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Unauthorized");
  });

  it("returns 401 when token is revoked", async () => {
    //Arrange
    const { token } = await registerAndLogin();
    await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    //Act
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    //Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Token has been revoked.");
  });

  it("returns 404 when no user with provided id exists", async () => {
    //Arrange
    const token = signToken(9999);

    //Act
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    //Assert
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("No user found.");
  });
});

describe("POST /auth/logout", () => {
  it("returns 204 for a valid token", async () => {
    // Arrange
    const { token } = await registerAndLogin();

    // Act
    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(204);
  });

  it("returns 401 when authorization header not provided", async () => {
    // Act
    const res = await request(app).post("/auth/logout");

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("No token provided.");
  });

  it("returns 401 when the same token is used again after logout", async () => {
    // Arrange
    const { token } = await registerAndLogin();
    await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    // Act
    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Token has been revoked.");
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
