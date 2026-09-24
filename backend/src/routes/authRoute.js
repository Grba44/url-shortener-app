import express from "express";
import bcrpyt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { validateUser } from "../middleware/authMiddleware.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { emailRateLimit } from "../middleware/rateLimiter.js";
import { signToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const hashedPassword = await bcrpyt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = signToken(newUser.id);

    res.status(201).json({ token });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "User with provided email or username already exists.",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", emailRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }

    const served = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!served) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await bcrpyt.compare(password, served.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(served.id);

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", validateUser, async (req, res) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "No user found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", validateUser, async (req, res) => {
  try {
    const { jti, exp } = req.user;

    await prisma.revokedToken.upsert({
      where: { jti },
      update: {},
      create: { jti, expiresAt: new Date(exp * 1000) },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
