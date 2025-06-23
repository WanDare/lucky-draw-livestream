import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/lucky-draw-livestream/" : "/", // 🧠 Use '/' in dev, proper base in prod
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        format: "es",
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  plugins: [viteCompression()],
}));
