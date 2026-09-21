import { httpClient } from "../../../shared/api/httpClient";

export const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || "b26e072e-4c58-47e6-84a2-eac835e6eaa0";

export const loginRequest = async ({ email, password, captchaToken }) => {
  const res = await httpClient.post("/auth/login", { email, password, captchaToken });
  return res.data;
};

export const signupRequest = async ({ email, username, password }) => {
  const res = await httpClient.post("/auth/signup", { email, username, password });
  return res.data;
};

export const getMeRequest = async (config) => {
  const res = await httpClient.get("/auth/me", config);
  return res.data;
};
