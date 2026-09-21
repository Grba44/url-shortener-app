import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const validateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.jti) {
      return res
        .status(401)
        .json({ message: "Token has no unique identifier." });
    }

    const revoked = await prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });

    if (revoked) {
      return res.status(401).json({ message: "Token has been revoked." });
    }

    req.user = { id: payload.userId, jti: payload.jti, exp: payload.exp };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
