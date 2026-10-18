# Corridor controls and live-screen QA — 18 October 2026

Scope: corridor input, Work Room LEDs, boot readiness, Moon edge projection, About portrait/background and Forma preview. Exterior city/ocean untouched.

## Final behavior

- Default: central reticle, hidden scene pointer, slower mouse look, wheel walking along the view heading. Stationary edges do not rotate the camera. Vertical travel reaches 88 degrees without flipping.
- Esc or the corner button switches to normal free cursor; Esc/button resumes looking without a jump. Website/menu review retains the selected mode.
- LEDs require an explicit click near/in front of the screen. The camera aligns over one second; an outside click returns to the original pose/mode. A deliberate second click may reopen the same LED.
- All five embeddable websites begin loading during corridor boot and stay mounted across rooms/roof visits. Room architecture and doors already participate in scene loading/compilation. Loader release now waits for those scene frames and all website readiness results; the 12-second forced release was removed.
- Physical capture textures remain beneath live apertures while loading or on fallback. A no-CORS HEAD reachability check, iframe load, and two paint frames precede promotion. Network failure or a 30-second deadline allows capture fallback; disposal aborts the probe and cancels callbacks.

## Browser checks

| Screen | Visible content | Review and exit | Scroll |
| --- | --- | --- | --- |
| Forma | Live page | Explicit click; one outside click; same-LED reopen; both cursor modes | Live document moved to scrollTop 6006.67 |
| Sanaira | Live page | Explicit click; held room; one-click return | scrollTop 710 |
| PRIMA | Live page | Explicit click; held room; one-click return | Its current home document fits 900px, with no vertical overflow |
| Veyravael | Live page | Explicit click; held room; one-click return | scrollTop 2723.33 |
| Bum.Life | Live page | Explicit click; held room; one-click return | scrollTop 787.33 |
| Rantle | Capture | Separate real-site link retained | Embedding deliberately unavailable (SAMEORIGIN policy) |

Scroll changes above used keyboard input through the real iframe document. Native wheel automation cannot reliably address fractionally scaled iframe coordinates. The user previously confirmed smooth actual-wheel scrolling on Forma and Sanaira; that limitation is not counted as a fresh native-wheel pass.

Further observations:
- After walking to the roof all five iframe nodes remained live and hidden, preserving their pages instead of reloading the opposite wall.
- One real mouse sweep reached 87.44 degrees upward. Stationary edge yaw/pitch remained unchanged over repeated observations.
- After review return, the first mouse movement rebased without changing pitch/yaw. A subsequent 100px horizontal movement at an 871px viewport changed yaw by 0.04139rad (2.37 degrees), with no pitch jump.
- Mode button verified body.looking clears on the next frame; free cursor survives review exit. Both mode controls and review instructions have distinct roles.
- Moon center/left/right rendered as a round stable-size disc; automated screen-projection tests include regular and ultrawide aspect ratios and cube-camera restoration.
- Corridor portrait uses the Web About dark blue background through shared palette/gradient code. About project screen, label, image and case-study link now use Forma.

## Validation

235 tests passed; production build passed; SEO generation/check passed for 14 direct-load routes. Existing large Three.js bundle warning remains. Independent review found two pitch handoff cases and exterior reticle dispatch issues, all corrected and checked. Current five external embed responses were audited as HTTP200 without XFO/CSP/CORP restrictions.

Static embedding boundary: opaque fetch can prove network reachability, but cannot expose future HTTP error status or new framing-policy headers. A third-party app-ready handshake is not available for those remote websites. Current live documents were therefore also visually verified. This is not a guarantee about future changes made by external sites.

No commit, push, deploy, or additional server port.

Final normal-entry verification: actual / initially showed boot=on with no ready frames; final boot=off contained all five live website states. Clicking at physical pointer coordinate (110,500) while the centre dot aimed at the door started the entering phase; pointerLockElement was null. The normal menu then walked to Work, where all six displays were present without QA fixtures. Independent final review reported no remaining material issues. Clean proof: work-room-final-clean.jpg in the controls-about-2026-10-18 artifact folder. Temporary workspace fixtures were removed.
