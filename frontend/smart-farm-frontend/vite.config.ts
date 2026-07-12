import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Backend GraphQL server (o'zgartiring agar port farq qilsa)
      "/graphql": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
