import request from "supertest";
import app from "../src/app.js";

export const createSignupPayload = (overrides = {}) => {
  return {
    email: "test@mail.com",
    username: "Test",
    password: "ThisIsATest123!",
    ...overrides,
  };
};

export const registerUser = async (customPayload = {}) => {
  const payload = createSignupPayload(customPayload);

  await request(app).post("/auth/signup").send(payload);

  return payload;
};

export const registerAndLogin = async () => {
  const payload = await registerUser();

  const res = await request(app).post("/auth/login").send(payload);

  return { ...payload, token: res.body.token };
};
