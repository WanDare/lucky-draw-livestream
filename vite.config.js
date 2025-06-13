import { defineConfig } from "vite";

export default defineConfig({
  base: "/lucky-draw-livestream/",
  server: {
    port: 3000, // Development server port
  },
  build: {
    outDir: "dist", // Output directory for build
    rollupOptions: {
      output: {
        format: "es", // ES module format
      },
    },
  },
});
