import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
  port: 3000,
    proxy: {
    '/api': {
      target: 'http://localhost:8080',
        changeOrigin: true,
      },
  },
},
build: {
  chunkSizeWarningLimit: 1200,
    rollupOptions: {
    output: {
      manualChunks(id: string) {
        if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
          return 'antd-vendor';
        }
        if (id.includes('node_modules/recharts')) {
          return 'charts-vendor';
        }
        if (
          id.includes('node_modules/react') ||
          id.includes('node_modules/react-dom') ||
          id.includes('node_modules/react-router-dom') ||
          id.includes('node_modules/zustand')
        ) {
          return 'react-vendor';
        }
      },
    },
  },
},
});
