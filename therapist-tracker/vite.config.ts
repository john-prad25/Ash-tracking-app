import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/calendly-ical': {
        target: 'https://calendly.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/calendly-ical/, ''),
      },
    },
  },
});
