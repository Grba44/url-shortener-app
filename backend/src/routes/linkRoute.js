import express from "express";
import { validateUser } from "../middleware/authMiddleware.js";
import { isValidUrl } from "../utils/validators.js";
import { prisma } from "../lib/prisma.js";
import { generateShortCode } from "../utils/shortCode.js";
import { buildShortUrl } from "../utils/shortUrl.js";

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
            originalUrl: originalUrl.trim(),
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

    res.status(201).json({ link, shortUrl: buildShortUrl(link.shortCode) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", validateUser, async (req, res) => {
  try {
    const { id } = req.user;
    const links = await prisma.link.findMany({
      where: { ownerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      links: links.map((link) => ({
        ...link,
        shortUrl: buildShortUrl(link.shortCode),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", validateUser, async (req, res) => {});

router.patch("/:id", validateUser, async (req, res) => {});

router.delete("/:id", validateUser, async (req, res) => {});

export default router;
