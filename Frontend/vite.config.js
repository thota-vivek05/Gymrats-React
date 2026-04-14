import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
        secure: false,
      },
      "/signup": {
        target: "http://backend:3000",
        changeOrigin: true,
        secure: false,
      },
      "/trainer": {
        target: "http://backend:3000",
        changeOrigin: true,
        secure: false,
      },
      "/appointments": {
        target: "http://backend:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
