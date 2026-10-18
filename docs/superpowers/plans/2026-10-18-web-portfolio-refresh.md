# Web Portfolio Refresh Implementation Plan

> Execution: implement inline in the existing working tree. No commit, push, deploy or additional server port.

**Goal:** Carry the approved Work Room curation into the Web Experience, refresh the Corridor case study, serve Web directly on mobile, and match the boot loader to the hero atmosphere.

**Architecture:** Reuse the existing project data and screenshot-scrolling components. Keep immersive and standalone styling separate. Gate the root route before rendering the lazy 3D experience on mobile. Share the signal background's paint and trace configuration between hero and boot.

**Tech stack:** Existing React, React Router, GSAP, Vite, local WebP media.

## Constraints

- Work order: Sanaira, Forma, PRIMA, Veyravael, Rantle, Bum.Life.
- Home priority: Forma, Sanaira, PRIMA.
- Replace BizCare and Bansar; retain other selected projects.
- Feature only the Corridor personal-portfolio case study; retain working legacy navigation safely.
- Preserve full-page screenshot hover scrolling and detail-page content conventions.
- Keep logo and loader headline; improve loading feedback and reuse exact hero grid/trace alignment.
- Mobile must not request/mount the Corridor scene.
- Existing exterior work stays untouched.

## Tasks

- [x] Capture genuine Forma and Veyravael hero, full-page, detail and responsive media; inspect the resulting files.
- [x] Update shared project curation, palettes and case-study content; use the same order in the room and standalone Work.
- [x] Feature Forma on Home, followed by Sanaira and PRIMA; remove the Web portfolio featured item and refresh the Corridor case study with current evidence.
- [x] Experiment with a quieter shared interface presentation around the existing scrolling captures; verify Work and detail pages in both themes.
- [x] Add a mobile root gate that renders Web without importing the 3D route; release the boot loader when Web's hero is ready.
- [x] Share signal traces/CSS with the loader and add clear indeterminate loading feedback; retain reduced-motion support.
- [x] Verify project links, hover scroll/reset, case-study next links, mobile routing/resource behavior, loader handoff, both themes, tests, build and SEO. Remove temporary capture/QA routes and leave port 3001 preview open.

## Review Focus

- No undefined projects after replacing slugs; no removed project left in homepage or next-study navigation.
- Full-page captures decode before animated scrolling; fallback images stay visible.
- Mobile root loads the Web route without the Three.js scene and the boot loader cannot get stuck.
- Loader trace positions match the hero's 72px grid in both themes and reduced motion.
- Shared frame changes preserve existing hover scrolling and do not affect immersive LED framing.
