import axios from "axios";
import { getToken } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.response = { data: { message: "Network error. Please try again." } };
    } else if (err.response.status >= 500 && !err.response.data?.message) {
      err.response.data = {
        ...err.response.data,
        message: "Something went wrong on our end. Please try again later.",
      };
    }
    return Promise.reject(err);
  },
);
