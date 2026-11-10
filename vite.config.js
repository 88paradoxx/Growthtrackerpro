import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));

// `npm run build:offline` makes a copy you can open straight from a folder
// (double-click index.html). Browsers block <script type="module"> on file://,
// so in that mode the single bundle is loaded as a classic deferred script.
const offlineHtml = () => ({
  name: 'growvita-offline-html',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html
      .replace(/<script type="module" crossorigin src=/g, '<script defer src=')
      .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=')
  }
});

export default defineConfig(({ mode }) => ({
  // Relative asset paths: works at a domain root, in a sub-folder, or from file://
  base: './',
  plugins: [react(), mode === 'offline' && offlineHtml()].filter(Boolean),
  build: {
    outDir: mode === 'offline' ? 'dist-offline' : 'dist',
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        growth: resolve(root, 'growth.html'),
        milestones: resolve(root, 'milestones.html'),
        nutrition: resolve(root, 'nutrition.html'),
        period: resolve(root, 'period.html'),
        edd: resolve(root, 'edd.html')
      }
    }
  }
}));
