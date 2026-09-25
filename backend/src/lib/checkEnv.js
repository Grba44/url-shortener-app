import "dotenv/config";

const REQUIRED_ENV = [
  "DATABASE_URL",
  "JWT_SECRET",
  "HCAPTCHA_SECRET",
  "CORS_ORIGIN",
  "BASE_URL",
];

const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
}

if (process.env.BASE_URL.endsWith("/")) {
  throw new Error(
    "Configuration Error: BASE_URL must not end with a trailing slash (/).",
  );
}
