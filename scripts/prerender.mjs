// Post-build step (run by `npm run build`):
// 1. Renders every page to static HTML inside its <div id="root">.
// 2. Writes sitemap.xml, robots.txt and llms.txt from src/seo.js.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAGES, SITE_URL, SITE_NAME, pageUrl } from '../src/seo.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, '.ssr');

const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href);

for (const [key, page] of Object.entries(PAGES)) {
  const file = resolve(dist, page.file);
  const html = await readFile(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error(`No empty #root in ${page.file}`);
  const out = html.replace('<div id="root"></div>', `<div id="root">${render(key)}</div>`);
  await writeFile(file, out);
  console.log(`prerendered ${page.file}`);
}

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(PAGES).map((k) => `  <url><loc>${pageUrl(k)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;

// Search engines and AI assistants (answer engines, agents) are all welcome.
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'];
const robots = `User-agent: *
Allow: /

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`;

const llms = `# ${SITE_NAME}

> Free child health and pregnancy calculators, built and clinically reviewed by Dr Mir Bilal, MBBS, MD Pediatrics. Everything runs in the browser; nothing entered is sent to a server.

## Tools

${Object.entries(PAGES).filter(([k]) => k !== 'home').map(([k, p]) => `- [${p.appName || p.name}](${pageUrl(k)}): ${p.description}`).join('\n')}

## Pre-filled links

- Due date: ${pageUrl('edd')}?lmp=YYYY-MM-DD (first day of last menstrual period)
- Period & ovulation: ${pageUrl('period')}?lmp=YYYY-MM-DD&cycle=28 (cycle length 21–40 days)

## Notes

- Results are estimates for education and screening support, not a diagnosis.
- Each tool page has a FAQ section with common questions answered.
`;

await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
await writeFile(resolve(dist, 'robots.txt'), robots);
await writeFile(resolve(dist, 'llms.txt'), llms);
await rm(ssrDir, { recursive: true, force: true });
console.log('wrote sitemap.xml, robots.txt, llms.txt');
