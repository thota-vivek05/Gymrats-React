import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // --- FORCE VITE TO USE 5173 OR CRASH ---
    port: 5173,
    strictPort: true, 
    
    // --- YOUR PROXIES ---
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/signup": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/trainer": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/appointments": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});