import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage, ServerResponse } from "http";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

          if (req.url?.endsWith(".wasm")) {
            res.setHeader("Content-Type", "application/wasm");
            res.setHeader("Cache-Control", "public, max-age=31536000");
          }

          if (req.url?.includes("/wasm/") && req.url?.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          }

          next();
        }
      );
    },

    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "https://api.seleniun.com",
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => path,
      },
    },
  },

  plugins: [
    react(),
    svgr(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  optimizeDeps: {
    exclude: ["pdfcpu.wasm"],
  },

  assetsInclude: ["**/*.wasm"],

  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".wasm")) return "wasm/[name][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
}));