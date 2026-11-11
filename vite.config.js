import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { PAGE_BY_FILE, buildHeadTags } from './src/seo.js';
const root = dirname(fileURLToPath(import.meta.url));

// Swaps each page's placeholder <title>/<meta description> for the full set
// of SEO tags from src/seo.js (title, description, canonical, Open Graph,
// JSON-LD). Runs in dev and build.
const seoHead = () => ({
  name: 'growvita-seo-head',
  transformIndexHtml: {
    order: 'pre',
    handler: (html, ctx) => {
      const key = PAGE_BY_FILE[basename(ctx.filename || ctx.path || '')];
      if (!key) return html;
      return html
        .replace(/<title>[\s\S]*?<\/title>/, '')
        .replace(/<meta name="description"[^>]*>/, '')
        .replace('</head>', `${buildHeadTags(key)}</head>`);
    }
  }
});

// Google Tag Manager (website build only — not dev, not the offline copy).
// Privacy: query parameters (e.g. ?lmp=… dates in pre-filled links) are moved
// out of the address bar into window.__GV_QUERY *before* Tag Manager loads,
// so they never reach Google. Advertising consent defaults to denied.
export const GTM_ID = 'GTM-K3CHPK7B';
const analytics = () => ({
  name: 'growvita-analytics',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html
      .replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1
<script>(function(){try{var q=location.search;if(q){window.__GV_QUERY=q;history.replaceState(history.state,'',location.pathname+location.hash);}}catch(e){}})();
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script>`)
      .replace(/<body([^>]*)>/, `<body$1>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`)
  }
});

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

export default defineConfig(({ mode, isSsrBuild }) => ({
  // Relative asset paths: works at a domain root, in a sub-folder, or from file://
  base: './',
  plugins: [react(), seoHead(), mode === 'offline' && offlineHtml(), mode !== 'offline' && !isSsrBuild && analytics()].filter(Boolean),
  build: {
    outDir: mode === 'offline' ? 'dist-offline' : 'dist',
    rollupOptions: isSsrBuild ? {} : {
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
