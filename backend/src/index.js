import "dotenv/config";
import "./lib/checkEnv.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { rateLimit } from "express-rate-limit";
import { prisma } from "./lib/prisma.js";

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

const PORT = process.env.PORT || "3000";

app.use("/auth", authRouter);

const purgeExpiredRevokedTokens = () =>
  prisma.revokedToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch((error) => console.error(error));

purgeExpiredRevokedTokens();
setInterval(purgeExpiredRevokedTokens, 60 * 60 * 1000).unref();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
