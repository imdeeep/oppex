import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    strictPort: true,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  optimizeDeps: {
    // Safari caches versioned dep URLs; after a dev-server restart the old hash 504s.
    ignoreOutdatedRequests: true,
  },
});
