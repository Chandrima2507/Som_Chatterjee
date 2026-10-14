import { defineConfig } from 'vite';
import { resolve } from 'path';
import { apiApp } from './server/routes.js';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/*.gif', '**/*.mp3', '**/*.mpeg', '**/*.png', '**/*.jpg', '**/*.jpeg']
    }
  },
  plugins: [
    {
      name: 'som-backend-api',
      configureServer(server) {
        server.middlewares.use('/api', apiApp);
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});
