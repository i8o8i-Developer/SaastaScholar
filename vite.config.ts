import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(import.meta.dirname, "./Public"),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./Src"),
    },
  },
  server: {
    port: 7865,
    host: "0.0.0.0",
  },
  preview: {
    port: 7865,
    host: "0.0.0.0",
  },
});
