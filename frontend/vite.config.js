import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Imports for tailwindcss and autoprefixer are removed as they are no longer used directly here.
// Vite will automatically detect and use postcss.config.cjs

export default defineConfig({
  plugins: [react()],
  // No css.postcss block here, allowing Vite to auto-detect postcss.config.cjs
});
