import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.js"],
    hookTimeout: 20000,
    environment: "node",
    fileParallelism: false,
  },
});
