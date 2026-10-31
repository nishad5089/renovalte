import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Support both domain-root hosting and GitHub Pages repository subpaths.
  base: './',
});
