import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
    // A `watch.ignored` rule for the public assets folder used to live here. It
    // stopped HMR churn while assets were regenerated, but it also meant any file
    // added to public/assets after the server started was never picked up:
    // requests fell through to the SPA fallback and the browser received
    // `text/html` for a .jpg or .webm, so images and video silently failed with
    // no 404 to explain it. Correctness beats the churn.
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
