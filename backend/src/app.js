import "dotenv/config";
import "./lib/checkEnv.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { rateLimit } from "express-rate-limit";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

const trustProxy = process.env.TRUST_PROXY
  ? Number(process.env.TRUST_PROXY)
  : false;

app.set("trust proxy", trustProxy);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Limit reached",
});

app.use("/auth/login", limiter);
app.use("/auth/signup", limiter);

app.use(express.json());

app.use("/auth", authRouter);

export default app;
