import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/renovalte/',
  plugins: [react()],
  // Support both domain-root hosting and GitHub Pages repository subpaths.
  base: './',
});
