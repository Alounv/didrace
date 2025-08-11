import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        "top-level-await": true,
      },
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  plugins: [
    tailwindcss(),
    solid(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3210",
        changeOrigin: true,
      },
    },
  },
});
