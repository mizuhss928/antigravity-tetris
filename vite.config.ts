import { defineConfig } from 'vite';

export default defineConfig({
  base: '/antigravity-tetris/',
  root: '.',
  server: {
    open: true,
    host: true
  },
  build: {
    outDir: 'dist'
  }
});
