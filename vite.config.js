import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/lucky-draw-livestream/",
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
});
