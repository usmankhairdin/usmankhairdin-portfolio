# Web refresh and local Forma capture QA

Scope: standalone Web Experience, current Corridor case-study content and the
mobile entry boundary. The approved exterior was not audited or edited in this
pass. Work Room interaction QA was completed before this pass; its evidence is
in the adjacent `work-room-live-2026-10-18/FINAL-QA.md` artifact.

## Evidence location

`C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/web-refresh-2026-10-18/`

## Ordered checks

1. Ran `D:/Graphic Work/Real Projects/store-usman/forma-ai` on port 3001, with
   its original source unchanged and its Vite cache outside the source tree.
   Saved `forma-local-desktop.jpg` (1440x1000), `forma-local-mobile.jpg`
   (390x844) and `forma-local-fullpage.png` (1440x9826). The full-page capture
   uses the site's settled reduced-motion composition through a temporary
   preview-only view, preventing repeated pinned headings. The visible globe
   and closing canvas were rendered before capture. Original source unchanged.
2. Restored portfolio preview on port 3001. No additional task port was used.
3. Checked Home in both themes: Forma hero, then Forma, Sanaira, PRIMA in the
   selected list. No broken images or horizontal overflow. Evidence:
   `home-after-light.jpg`, `home-after-dark.jpg`.
4. Checked Work data and rendered order: Sanaira, Forma, PRIMA, Veyravael,
   Rantle, Bum.Life. Only the Corridor personal portfolio item remains featured.
   Work Room derives the same sequence from shared data. The standalone stage
   removes browser chrome; immersive LED styling is unaffected.
5. Opened all six detail routes. Every preview loaded, every page had its case
   content and correct public link, and no horizontal overflow or failed image
   was observed. `project-route-qa.json` records the results; `detail-*.jpg`
   records the opening views. Confirmed screenshot hover motion on Forma,
   Veyravael and Bum.Life, plus Forma in the Work showcase. Screens use the
   existing shared capture component; standalone pages contain no iframes.
6. Reviewed new Forma body illustrations and Veyravael responsive layout.
   Images retain their real proportions and brand surfaces work in both
   themes. Phone case-study preview shows no horizontal overflow.
7. Fresh 390px root load rendered HomeWeb, dismissed the real boot loader,
   mounted zero canvases and exposed no Corridor entry button. The lazy entry
   and speculative preload guards have behavioral tests. Touch-tablet choice
   is covered by the preference test, not physical-device testing. Network
   transfer profiling was not available through this browser's read-only DOM
   interface; bundle selection was additionally reviewed in code/build output.
8. Inspected loader light/dark using a temporary fixture containing the real
   boot markup, CSS and trace module, holding it onscreen for visual review.
   Verified 20 traces, 72px grid pitch, origin 0px 0px, 3 animated dots and an
   indeterminate loading rail. Hero and boot consume the same trace data and
   stylesheet. The fixture was removed after capture. Actual mobile boot
   dismissal was checked separately.
9. Checked updated Corridor case: current Work Room and live Forma evidence,
   automatic look/walk wording, no old Esc/centre-dot instructions. The retired
   Web case address redirects to the Corridor case. On mobile the entry action
   offers Web Experience. No exterior re-audit.
10. Independent code review found a missing `hostLabel` import in Project.jsx;
    fixed before all-six-route verification. No further material findings.

## Final verification

- `node --test`: 223 passed, 0 failed.
- `npm run build`: passed; existing Three.js chunk size advisory remains.
- `npm run check:seo`: 14 indexed direct-load routes passed; 2 unlisted routes.
- `git diff --check`: passed.
- Fresh standalone browser review: no console errors observed.
- No commit, push or deployment.

This is flow and visual QA at the captured desktop/phone sizes, not an
exhaustive guarantee across every device, browser and possible interaction.
