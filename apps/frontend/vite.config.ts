import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 5173 é a origem esperada no ALLOWED_ORIGIN do backend;
  // a 3000 já é usada pela própria API.
  server: {
    port: 5173
  }
})
