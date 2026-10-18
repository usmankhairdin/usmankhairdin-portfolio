# Release cleanup, performance and link verification — 18 October 2026

This release follows the corridor [micro audit](2026-10-18-corridor-micro-audit.md) and [Web refresh review](2026-10-18-web-refresh.md). The user authorized removing retired/unlinked material, preserving live portfolio demos, verifying performance and links, and then pushing the current work to Git.

## Loading measurements

Production Vite preview, the same local port 3001 and in-app browser, cached local assets, no network throttling. Times measure the branded loader disappearing, not just its logo painting. These are local samples, not cold-cache or live-host speed guarantees.

| Version | Initial sample | Repeat sample |
| --- | ---: | ---: |
| Before cleanup | 22.99 s | 19.31 s |
| Final asset gate and parallel website preparation | 9.41 s | 9.63 s |

An intermediate iframe-only preloading experiment measured 28.46 s and did not establish an improvement. The final implementation also prepares the exact model/texture loader cache entries before constructing the expensive world. This avoids reconstructing procedural scene content between asset suspensions. The five final iframe nodes begin loading during boot and are retained for the visit; mounting an LED does not move or reload its website.

Both final five-second frame samples recorded 300 frames, mean 16.67 ms, p95 16.8 ms, and zero frame intervals above 50 ms. This describes the sampled view only. Web Experience readiness measured 0.82 s after versus 0.67 s before; no Web speed improvement is claimed. The Web resource list contained no immersive scene/model load. External iframe performance can vary independently of the portfolio.

## Cleanup and compression

- Removed the unlinked `public/portfolio/PNWLeads` folder, including its nested `node_modules` (10,472 files, 118.61 MiB), and retired BizCare demo (22 files, 5.76 MiB).
- Removed retired BizCare, Bansar and PNW project media/data, the superseded standalone Web portfolio item, obsolete capture scripts and unused source modules. Kept the old Web case-study URL as a redirect to the Corridor case study.
- Removed temporary review pages/scripts/captures from the project. Audit evidence is stored outside the project. No performance probe is included in the final build.
- Preserved the complete Bum.Life runtime and shared demo-form helper. Converted 32 used PNGs to lossless WebP: 80,231,956 to 59,278,856 bytes. Decoded dimensions and RGBA bytes matched for every conversion. Removed five unreferenced PNGs separately. All demo filename references were updated.
- Losslessly encoded the forest buffer with meshoptimizer: 25,381,868 to 17,494,369 bytes. All 88 decoded buffer views retain the original combined SHA-256 `4c936419d73d356bd8dbfa4f368d254955185ba8074138387b265c36e026f0ea`. No geometry quantization or simplification. The actual Three.js loader also parsed 34 meshes without invalid coordinates. Decoder licensing is included.
- There are no nested `node_modules` under `public`. The root application's ignored `node_modules` remains necessary for development/builds. Deployed static demos do not need those build dependencies.
- Local production output decreased from 313,990,222 bytes / 11,080 files (299.44 MiB) to 130,302,837 bytes / 468 files (124.27 MiB), about 58.5% smaller. This is the full local output, not an initial-page download. The old CI workflow stripped portfolio directories before building, so this is not a comparison with the previous deployed archive.

## Links and browser checks

The final checker resolved **232 asset paths**, **292 local demo dependencies**, **17 local routes** and **14 public URLs**, with no missing local dependency or confirmed broken external URL. All current portfolio demo destinations returned HTTP 200. Upwork (403), LinkedIn (999), and Pexels (403) restrict automated requests; these responses are not classified as successful checks or broken links. The Upwork profile was independently found through the public web lookup; LinkedIn and Pexels remain automated-verification limits.

The browser rendered all 14 standalone pages/current case studies and inspected their anchors: no missing same-page fragment target. Bum.Life's optimized home images and character-page images loaded; its navigation opened the character page. No forms were submitted.

The normal corridor boot reported all five websites live. The Work Room showed the live sites. Sanaira review opened, its document scrolled to approximately 897 px, and one outside click exited. Only the selected frame accepted input during review; afterward all five remained live and none accepted input. The existing close-distance focus guard correctly prevented activation while still outside the screen's bay. Rantle remains a capture because its host refuses framing. The earlier complete room/screen review is documented in the linked micro audit.

Native Pointer Lock and scaled cross-origin mouse-wheel automation remain the browser limitations described in that audit; this release does not claim a new physical Chrome/Firefox mouse test. The user's own smooth-wheel confirmation remains part of the session evidence.

## Final verification and deployment packaging

- `npm test`: **246 passed, 0 failed**, 23.79 s.
- `npm run build`: passed; final Vite build 3.68 s, generated direct-load HTML. The existing large Three.js chunk warning remains.
- `npm run check:seo`: passed for 14 direct-load routes.
- `npm run check:links -- --offline`: passed; full local/public link run also recorded no issues, subject to the blocked-site limits above.
- Production dependency audit: **0 vulnerabilities**. The compatible transitive `source-map-js` update also cleared the earlier full-install audit finding.
- Git whitespace validation passed after cleanup. Independent review found no actionable preload ownership, cache-key, lifecycle or interaction regression.

The existing `main` push workflow deploys to Namecheap. It now tests before building, checks routes/dependencies, and includes Bum.Life's complete optimized runtime. It preserves separately hosted portfolio folders such as Forma and Veyravael. Apache text compression and cache policy are configured; Vite preview does not exercise Apache, so live response headers require post-deployment verification.

Evidence: [release measurements and screenshots](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18>). Key files are `load-before*.json`, `load-after-gate*.json`, `load-web-after.json`, `links-final.json`, `rendered-link-audit.json`, `dist-size-after.json`, `release-tests.tap`, `release-build.log`, and `release-sanaira-scrolled.jpg`.
