import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  clean: true,
  format: "esm",
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
    };
  },
});
