// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    srcDirectory: "Src",
    router: {
      routesDirectory: "Routes",
      generatedRouteTree: "RouteTree.gen.ts",
    },
    // Redirect TanStack Start's bundled server entry to Src/Server.ts
    server: { entry: "Server" },
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "Src"),
      },
    },
  },
});
