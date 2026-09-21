# Usman Khair Din — Interface Gallery

Local continuation build for Usman Khair Din’s premium personal brand and white-label agency sales website. The approved immersive corridor experience, warm material family, premium typography and cobalt CTA language remain the visual foundation.

## Locked featured work
- PRIMA — https://primaapp.com/
- BizCare — https://www.usmankhairdin.com/portfolio/bizcare/
- Bansar China — https://www.bansarchina.com/
- Rantle — https://www.rantle.com/
- Bum.Life — https://www.usmankhairdin.com/portfolio/bum.life/
- PNWLeads — https://www.usmankhairdin.com/portfolio/PNWLeads/

The corresponding internal routes are `/work/prima/`, `/work/bizcare/`, `/work/bansar/`, `/work/rantle/`, `/work/bum-life/` and `/work/pnw-leads/`. This set is authoritative; do not substitute other projects.

## Current QA state

- The runtime dataset, Work page, immersive Work room, project-detail routes, metadata and sitemap all use the same six-project source.
- Work is a pinned horizontal exhibition: one deliberate wheel gesture moves exactly one project panel, and the first/last panel hands scrolling back to the page.
- Each project carries its own solid surface (`surfaceLight` / `surfaceDark` in `src/data/projects.js`), shared by its Work panel and its case-study hero.
- Each case-study body uses that project's own brand palette from `src/data/projectBrands.js`; the layout and typography stay UKD's.
- The completed phase reports and QA screenshot archives were removed once superseded; this README, `AGENTS.md`, `DEPLOYMENT_CPanel.md` and `THIRD_PARTY_NOTICES.md` are the current documents.

## Implementation highlights
- Selected-work index rebuilt as a six-project editorial sequence using actual public-project interfaces.
- Each case-study route has project-specific composition, color, responsive evidence, factual contribution context and an agency-facing CTA.
- Optimized WebP captures live under `public/assets/projects/<slug>/`; local SVG posters remain last-resort error fallbacks only.
- No runtime screenshot-service URLs or preconnects remain. The Work page, case studies and immersive Work room use the same local media source.
- Work-room project wall keeps the protected wheel/keyboard controls, exact six-project count, `object-fit: contain` behavior and exit handling.
- Every public/live project link opens in a new tab so the portfolio remains open.
- `/portfolio/...` links remain outbound references; deployment must preserve the existing `/portfolio` folder on the domain.
- About, Services, For Agencies, Contact, Work and project-detail pages receive a richer branded visual layer while preserving the cream/ink/accent system.
- Contact form is configured to deliver to `brief@usmankhairdin.com` through FormSubmit.
- About, Services, For Agencies and Contact now use distinct route-authored working diagrams while retaining the shared Usman Khair Din brand material and cobalt action system.
- The immersive runtime is lazy at the home route; standard routes receive a small application entry and retain their approved visual rendering. The Phase 06 report records exact production-build measurements and regression coverage.

Rantle currently serves a bot-verification page to automated browser sessions. Its live link is unchanged; the local portfolio media uses an actual dated public-page capture and does not fabricate a mobile state.

## Local run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

Do not push or deploy without explicit approval.

## Repository layout

```
src/components   shared UI (header, menu, footer, browser frame, project hero, forms)
src/pages        routes and their page-scoped styles
src/data         projects, project brand palettes, section heroes
src/theme        theme tokens, generated dark sheet, ThemeProvider
src/scroll       Lenis controller, provider, Back to Top
src/cursor       the shared magnetic cursor
src/loader       boot loader hand-off
src/experience   immersive corridor (3D) — final, do not refactor
src/rooms        corridor rooms — final, do not refactor
scripts          dark-theme generator and the project media capture pipeline
```

`src/theme/dark-web.css` is generated. After editing `src/styles.css` or `src/pages/Project.css`, re-run:

```bash
node scripts/generate-dark-theme.mjs
```
