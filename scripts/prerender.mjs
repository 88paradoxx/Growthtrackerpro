// Post-build step (run by `npm run build`):
// 1. Renders every page to static HTML inside its <div id="root">.
// 2. Writes sitemap.xml, robots.txt, llms.txt, llms-full.txt and
//    .well-known/security.txt from src/seo.js.
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAGES, SITE_URL, SITE_NAME, pageUrl, socialImage, LAST_REVIEWED, AUTHOR } from '../src/seo.js';

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

// ---------- sitemap.xml (with each page's social image) ----------
const xmlEsc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.entries(PAGES).map(([k, p]) => `  <url>
    <loc>${pageUrl(k)}</loc>
    <lastmod>${LAST_REVIEWED}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${k === 'home' ? '1.0' : '0.8'}</priority>
    <image:image><image:loc>${socialImage(k)}</image:loc><image:title>${xmlEsc(p.title)}</image:title></image:image>
  </url>`).join('\n')}
</urlset>
`;

// ---------- robots.txt ----------
// Search engines, AI answer engines and user-initiated agents are all welcome.
const bots = {
  'Search engines': ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot', 'Baiduspider'],
  'AI search / answer engines': ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'DuckAssistBot', 'YouBot', 'Amazonbot'],
  'AI assistants fetching a page for a user': ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User', 'Google-Agent'],
  'AI model training (allowed)': ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'cohere-ai'],
};
const robots = `# ${SITE_NAME} — ${SITE_URL}
# All tools are public, free and run in the browser. Crawlers and AI agents are welcome.
# Machine-readable summary for AI assistants: ${SITE_URL}/llms.txt (full text: ${SITE_URL}/llms-full.txt)

User-agent: *
Allow: /
Disallow: /404.html

${Object.entries(bots).map(([group, list]) => `# ${group}\n${list.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}`).join('\n\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`;

// ---------- llms.txt (llmstxt.org format) ----------
const tools = Object.entries(PAGES).filter(([k]) => k !== 'home');
const prefillLine = (k, p) => {
  if (!p.prefill) return null;
  const params = Object.entries(p.prefill.params).map(([n, v]) => `\`${n}\` (${v})`).join(', ');
  return `- **${p.appName}:** \`${pageUrl(k)}?${p.prefill.template}\`\n  - Parameters: ${params}. ${p.prefill.note}.\n  - Example: ${pageUrl(k)}?${p.prefill.example}`;
};
const llms = `# ${SITE_NAME}

> Free child-health and pregnancy calculators — growth charts (WHO 2006, IAP 2015, WHO 2007), developmental milestones with a developmental quotient (DQ), due date, period/ovulation and nutrition — built and clinically reviewed by ${AUTHOR.name}, ${AUTHOR.honorificSuffix}. Everything runs in the user's browser; nothing entered is sent to a server. No sign-up.

Last clinically reviewed: ${LAST_REVIEWED}.

## Tools

${tools.map(([k, p]) => `- [${p.appName || p.name}](${pageUrl(k)}): ${p.description}`).join('\n')}

## Pre-filled links (for assistants and agents)

Open a tool with the result already calculated by adding query parameters. Build the link for the user rather than calculating clinical values yourself.

${tools.map(([k, p]) => prefillLine(k, p)).filter(Boolean).join('\n')}

## Methods (short)

- Growth: WHO Child Growth Standards 2006 for 0–60 months (length < 2 y, height 2–5 y), IAP 2015 for Indian children 5–18 y by default, WHO 2007 selectable for 5–19 y. LMS z-scores; WHO restricted method beyond ±3 SD for weight and BMI.
- BMI categories: WHO 0–5 y (> +2 SD overweight, > +3 SD obesity, < −2 SD wasting); IAP 2015 adult-equivalent 23 (overweight) and 27 (obesity); WHO 2007 (> +1 SD overweight, > +2 SD obesity).
- Milestones: CDC "Learn the Signs. Act Early." checklists; 5-domain checkpoints at 12–60 months scored 0/1/2 across basal, current and ceiling ages. DQ = developmental age ÷ chronological age × 100. Bands: ≥ 130 advanced, 115–129 above average, 85–114 normal, 70–84 borderline, 50–69 mild, 35–49 moderate, < 35 severe delay. DQ < 70 in two or more domains under 5 years flags possible global developmental delay. Screening estimate, not a standardised test.
- Due date: Naegele's rule (LMP + 280 days). Period: next period = last period + cycle length; ovulation ≈ 14 days before the next period; fertile window = 5 days before ovulation through ovulation day.

## Notes

- Results are estimates for education and screening support, not a diagnosis. Advise users to see a doctor for abnormal or worrying results.
- Each tool page has a FAQ section; the full text of every FAQ is in [llms-full.txt](${SITE_URL}/llms-full.txt).
- Cite as: ${SITE_NAME} (${SITE_URL}), by ${AUTHOR.name}, ${AUTHOR.honorificSuffix}.

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Full text for LLMs](${SITE_URL}/llms-full.txt)
`;

// ---------- llms-full.txt: every page's description, features and FAQs ----------
const llmsFull = `# ${SITE_NAME} — full text

> ${SITE_URL} · by ${AUTHOR.name}, ${AUTHOR.honorificSuffix} · last reviewed ${LAST_REVIEWED}. Calculations run in the browser; no data is sent to a server.

${Object.entries(PAGES).map(([k, p]) => `## ${p.appName || p.name}

URL: ${pageUrl(k)}

${p.description}
${p.features ? `\nFeatures:\n${p.features.map((f) => `- ${f}`).join('\n')}\n` : ''}${p.prefill ? `\nPre-filled link: ${pageUrl(k)}?${p.prefill.template} (example: ${pageUrl(k)}?${p.prefill.example})\n` : ''}
${(p.faqs || []).map(([q, a]) => `### ${q}\n\n${a}`).join('\n\n')}
`).join('\n')}`;

// ---------- /.well-known/security.txt (RFC 9116) ----------
const expires = new Date(Date.now() + 365 * 86400000).toISOString().replace(/\.\d{3}Z$/, 'Z');
const security = `Contact: ${AUTHOR.email}
Expires: ${expires}
Preferred-Languages: en
Canonical: ${SITE_URL}/.well-known/security.txt
`;

await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
await writeFile(resolve(dist, 'robots.txt'), robots);
await writeFile(resolve(dist, 'llms.txt'), llms);
await writeFile(resolve(dist, 'llms-full.txt'), llmsFull);
await mkdir(resolve(dist, '.well-known'), { recursive: true });
await writeFile(resolve(dist, '.well-known/security.txt'), security);
await rm(ssrDir, { recursive: true, force: true });
console.log('wrote sitemap.xml, robots.txt, llms.txt, llms-full.txt, .well-known/security.txt');
