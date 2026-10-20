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
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (id.includes("pdfjs-dist")) {
              return "vendor-pdf";
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            if (id.includes("react-markdown") || id.includes("remark") || id.includes("micromark") || id.includes("unified")) {
              return "vendor-markdown";
            }
            if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul")) {
              return "vendor-radix";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("@tanstack/react-router")) {
              return "vendor-router";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react-core";
            }
            return "vendor-other";
          }
          return undefined;
        },
      },
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
