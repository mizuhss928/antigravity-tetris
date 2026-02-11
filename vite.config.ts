import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: true,
    host: true
  },
  build: {
    outDir: 'dist'
  }
});
