# GrowVita — Vite + React application

## Architecture
- Vite + React application shell with separate static entry pages: `index.html`, `growth.html`, `milestones.html`, `nutrition.html`, `period.html`, and `edd.html`.
- The existing growth assessment is preserved as `public/legacy-growth.html` and served within the React Growth page. This isolates the original WHO/IAP calculation engine, chart rendering, longitudinal records, and existing browser-side behaviour from the UI migration.
- Standalone React pages are provided for developmental milestones, nutrition guidance, period calculations, and LMP-only EDD calculations.
- The reference mother-and-child hero image is at `public/growvita-mother-child-hero.jpg` and `public/assets/hero.jpg`.

## Run locally
```bash
npm install
npm run dev
```

## Open without a server
```bash
npm run build:offline
```
Then double-click `dist-offline/index.html`. This build loads the bundle as a classic script (browsers block module scripts on `file://`) and falls back to normal page loads for navigation.

## Theme (light / dark)
- The choice is stored in `localStorage` under `growvita-theme` and applied by a small inline script in each page's `<head>` before paint (no flash).
- `src/theme.js` applies the theme and forwards it to the embedded growth page via `postMessage` (works on `http://` and `file://`).
- Light-theme styles are at the end of `src/style.css`; the legacy growth page's light overrides are in its `#gv-light-overrides` style block, and its canvas chart picks colours per theme.

## Growth page embedding
The legacy page reports its own body height to the parent (`GROWTH_RESIZE` message). The parent no longer measures the frame document, which previously grew by 20px on every resize and caused endless scrolling.

## Production build
```bash
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host such as Cloudflare Pages, Vercel, Netlify, or Firebase Hosting. All six HTML entry pages and the public legacy growth page must be deployed together.

## Important migration note
The WHO/IAP growth engine is intentionally retained as a standalone legacy page inside the hybrid application. This is a compatibility-preserving migration stage, not a rewrite of clinical algorithms. The new React modules have their own routes and independent inputs. The growth engine can be migrated component-by-component later after parity tests are created against the existing implementation.

## Routes
- `/` or `/index.html` — dashboard
- `/growth.html` — original growth calculator inside the React shell
- `/milestones.html` — independent developmental milestones checklist
- `/nutrition.html` — independent age-based nutrition guide
- `/period.html` — period and fertile-window calculator
- `/edd.html` — LMP-only EDD calculator

## Developmental assessment checklist
- The milestones page includes a separate five-domain developmental assessment checklist for ages 1–5.
- Checklist wording is transcribed from `public/reference/developmental-assessment-source.html`; the original source is retained unchanged.
- The checklist provides client-side completion tracking and browser print / Save as PDF.
- This checklist is informational and is not represented as a validated screening instrument.

## Repository / deployment status
- This is a standalone project and is not part of the GrowVita question-bank repository.
- No production deployment or custom domain is configured by this source package.
- Before launch, confirm product branding, canonical domain, contact email, and author details in the legacy growth page metadata.
