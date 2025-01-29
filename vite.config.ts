import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/react-web-socket-live-ticker/",
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
