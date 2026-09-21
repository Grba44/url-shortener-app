import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

export const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
    jwtid: randomUUID(),
  });
};
