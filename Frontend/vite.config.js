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
        target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/signup": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/trainer": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/appointments": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          redux: ["redux", "react-redux", "@reduxjs/toolkit"],
        },
      },
    },
  },
});
