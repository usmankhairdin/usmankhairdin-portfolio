# Corridor micro audit — 18 October 2026

Local preview: <http://127.0.0.1:3001/>. No commit, push, or deployment was made.

This review covers the immersive corridor, all four rooms, their displays and doors, the roof perimeter, sky, and parked helicopter. It does not redesign the separate Web Experience. The existing rooms and helipad are preserved, as requested. The roof now measures 109.5 m from front to rear, reduced from 127 m; the main corridor remains 62.2 m. Further shortening to corridor length would require moving rooms or the pad and was declined.

## Verdict and evidence limits

The defects reproduced during this audit have been corrected and the final automated suite passes. The browser review covered 21 observation stations with six views each, plus door crossings, screen interaction, sky measurements, and motion stress checks. This is broad sampled coverage, not a claim that every possible pixel, device, frame, or input combination is defect-free.

The in-app browser rejects native Pointer Lock. The actual browser motion checks therefore verified the drag fallback. Native relative-input calculations and capture/release races pass automated tests, but native capture in Chrome/Firefox could not be verified here; the Chrome connection was unavailable. The earlier assertion that limited movement checks constituted complete mouse QA was my mistake and is superseded by this report.

Browser automation could not reliably send a native mouse-wheel event into the scaled cross-origin website frames. This run verified actual website scrolling using PageDown, plus camera immobility and review exit. It does not claim a fresh native-wheel pass for every LED. PRIMA's current embedded homepage is one viewport high; zero scroll there is expected. Rantle remains a screenshot with its existing external link because its host disallows embedding.

Evidence folder: [micro-audit-2026-10-18](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18>).

## Numbered walkthrough

1. **Entrance and default control state.** A fresh normal-root load completed with all five live websites prepared. A real drag across the entrance overlay did not initiate a walk; the following intentional click initiated the entrance route and arrived inside. This corrects pointer samples being lost when a drag crossed the DOM door overlay and delayed click events activating it. Native pointer capture is requested only by a trusted gesture; Escape releases it. The reticle and camera share the same forward heading.

2. **Corridor movement and visual sweep.** Five corridor stations were inspected facing four horizontal directions, up, and down. Repeated physical drags completed more than one full turn in both directions; rapid reversals, vertical sweeps, and stationary checks did not reproduce the former viewport-limited look or edge auto-rotation. Relative look uses 0.00125 radians per pixel, unlimited yaw, and an 88-degree pitch limit. Recorded yaw targets reached -6.75 and +6.75 radians with body position unchanged. A settled idle comparison recorded zero yaw, pitch, or position change. Visible floor inlays, wall tiles, ceiling panels, lighting, artwork, and door frames showed no obvious detached seams or unintended flashing in the inspected views.

3. **All rooms and physical door passages.** About, Services, Work, and Contact were each inspected at entry, center, and far positions in six directions. Actual wheel-walk round trips crossed the entrance, all four room doors, and the Contact terrace door. The handled terrace door's opening and collision envelope were checked. Roof return routes had been able to run into its moving leaf; routing now reserves the full swing envelope, with a safe escape from an already-open threshold. Tests include those formerly failing positions. This routing reserve does not replace manual collision against the actual door leaf.

4. **Every Work display and review exit.** Forma, Sanaira, Veyravael, PRIMA, and Bum.Life loaded as live sites. Scrolling observations were approximately 5307, 3339, 2723, 0, and 2206 pixels respectively. Rantle's static display was inspected separately. Active reviews held the room camera fixed. One outside click closed each tested review; the selected frame alone accepted input, and the opposite display did not become a white interactive overlay in the inspected transitions. Cursor intent survives entering and leaving review. Iframe focus is no longer misclassified as leaving the browser. Mouse capture can resume in the original outside-click gesture while camera return completes.

5. **Roof circulation, lamps, and footprint.** Front, rear, east, and west roof stations were rechecked after shortening the footprint. Existing rooms, exit, supported parapet, and aircraft pad remain within the envelope; front lamps were moved with the edge. Door routing, roof circuits, building clearance, rotor/tail clearance, skid contact, and collision tests pass. The approved city layout is held stable when the roof footprint changes rather than reshuffling its seeded building sequence.

6. **Moon and galaxy.** Center, left, and right Moon captures measured 48×50, 49×50, and 49×50 thresholded pixels. The one-pixel difference is consistent with rasterization; the earlier large off-axis stretch was not reproduced. The unobstructed galaxy view was inspected separately from views where the actual building occludes it. No hard rectangular image border or orange horizon was visible in the accepted sky captures. Sky direction remains fixed as the visitor moves.

7. **Helicopter exterior and cabin.** The paint now uses the site's blue family while preserving neutral source markings. The cabin contains front seats and harnesses, rear seating and belts, instrument bezels/ticks/needles, radio controls, cyclic grips, collective/throttle controls, pedals/linkages, and interior handles. The added cabin has 151 meshes, 52 owned geometries, and nine owned materials with explicit disposal; shared model resources are retained. The cockpit was inspected from the side, nose, and a QA-only interior viewpoint. This is a parked visual model; flight controls are not functional, and the original model's texture resolution remains a limit.

## Accepted screenshots

The station contact sheets contain the full six-direction review. They are available in the evidence folder, alongside individual screenshots and JSON measurements. Temporary station controls visible in those captures were audit tools and have been removed from the project.

![Final normal-root Work room with all five websites loaded and no QA overlay](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18/22-normal-work-room.jpg>)

![Corridor floor, walls, ceiling, doors and lighting](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18/corridor-work-sheet.jpg>)

![Actual Work websites and off-axis Moon comparison](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18/final-evidence-review.jpg>)

![Blue helicopter and cabin through side glazing](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18/03-blue-helicopter-side.jpg>)

![Cockpit instruments and controls](<C:/Users/Usman/.codex/visualizations/2026/10/17/01a14bda-e339-7323-a7ed-35db3d3a277c/micro-audit-2026-10-18/19-cockpit-interior.jpg>)

## Accessibility and remaining verification boundaries

- Escape and a visible cursor-mode control provide a way to leave captured look. Automatic website focus pauses movement rather than sending input into both surfaces. Touch/pen hotspot taps retain their target instead of being retargeted to the canvas by the desktop drag fix.
- Small wall text, dark exterior surfaces, camera motion, and cross-origin website controls remain accessibility considerations. Screenshot review does not establish contrast compliance, screen-reader usability, vestibular comfort, or complete keyboard accessibility of the immersive scene. The separate Web Experience remains the accessible/mobile alternative.
- No new external-window, hardware mouse, touch-device, mobile-performance, or prolonged memory-leak certification is claimed. The build still reports the existing large Three.js chunk warning.

## Final verification

- `node --test tests/*.test.mjs`: **241 passed, 0 failed**; 19.57 s. Evidence: `final-tests.tap`.
- `npm run build`: **passed**; Vite 15.67 s, generated direct-load HTML. Evidence: `final-build.log`.
- `npm run check:seo`: **passed for 14 direct-load routes**.
- `git diff --check`: **passed**, with line-ending conversion notices only.
- Independent code review covered capture/release races, cabin geometry ownership, door-sweep routing, and touch/pen targeting. The review's actionable findings were fixed and the final suite rerun.
- Audit-only `.tmp-mouse-review` HTML/JSX and measurement/contact-sheet helpers were archived to the evidence folder and removed from the workspace. The normal root page is the handoff preview, using the existing port 3001.
