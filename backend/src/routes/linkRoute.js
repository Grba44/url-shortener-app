import express from "express";
import { validateUser } from "../middleware/authMiddleware.js";
import { isValidUrl } from "../utils/validators.js";
import { prisma } from "../lib/prisma.js";
import { generateShortCode } from "../utils/shortCode.js";

const router = express.Router();

router.post("/", validateUser, async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const { id } = req.user;

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ message: "Invalid url provided." });
    }

    let link;
    let success = false;

    for (let i = 1; i <= 3; i++) {
      try {
        const shortCode = generateShortCode();
        link = await prisma.link.create({
          data: {
            originalUrl: originalUrl,
            shortCode,
            ownerId: id,
          },
        });
        success = true;
        break;
      } catch (error) {
        if (error.code === "P2002") {
          const isShortCodeCollision = JSON.stringify(error.meta).includes(
            "shortCode",
          );

          if (isShortCodeCollision) {
            continue;
          }

          return res.status(409).json({
            message: "Provided link has already been shortened.",
          });
        }
        throw error;
      }
    }

    if (!success) {
      return res.status(500).json({
        message: "Could not generate a unique short code. Please try again.",
      });
    }

    const shortUrl = `${process.env.BASE_URL}/${link.shortCode}`;

    res.status(201).json({ link, shortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", validateUser, async (req, res) => {});

router.get("/:id", validateUser, async (req, res) => {});

router.patch("/:id", validateUser, async (req, res) => {});

router.delete("/:id", validateUser, async (req, res) => {});

export default router;
