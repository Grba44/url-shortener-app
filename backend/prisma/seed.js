import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.SEED_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: process.env.SEED_EMAIL,
      password: hashedPassword,
      username: process.env.SEED_USERNAME,
      usernameLower: process.env.SEED_USERNAME.toLowerCase(),
    },
  });

  console.log("Created user:", user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
