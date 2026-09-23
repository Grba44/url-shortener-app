import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || "3000";

const purgeExpiredRevokedTokens = () =>
  prisma.revokedToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch((error) => console.error(error));

purgeExpiredRevokedTokens();
setInterval(purgeExpiredRevokedTokens, 60 * 60 * 1000).unref();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
