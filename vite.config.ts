import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const port = parseInt(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || '/';

import fs from "fs";

function apiMockPlugin() {
  const dbPath = path.resolve(import.meta.dirname, "local_db.json");
  const loadDb = (): Record<string, any> => {
    try {
      if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn("Failed to load local_db.json:", e);
    }
    return {};
  };

  const saveDb = (data: Record<string, any>) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to save local_db.json:", e);
    }
  };

  const memoryStore: Record<string, any> = loadDb();

  return {
    name: 'api-mock-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/data')) {
          const url = new URL(req.url, 'http://localhost');
          const key = url.searchParams.get('key');
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') {
            const currentDb = loadDb();
            const val = key && key in currentDb ? currentDb[key] : (key && key in memoryStore ? memoryStore[key] : null);
            res.statusCode = 200;
            res.end(JSON.stringify({ value: val }));
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                if (key) {
                  memoryStore[key] = parsed.value;
                  const currentDb = loadDb();
                  currentDb[key] = parsed.value;
                  saveDb(currentDb);
                }
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    apiMockPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    strictPort: true,
    host: "0.0.0.0",
  },
});
