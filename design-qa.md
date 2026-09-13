# Hero instrument design QA

## Visual source

- Direction: an original, symmetric typographic "UI × FE" instrument that makes the partnership model immediately legible.
- Production visual material: verified-project captures remain in the work archive, documented in `public/projects/screens/README.md`.

## Implementation evidence

- Desktop: `http://localhost:3000/` inspected at 1280 × 720.
- Mobile: `http://localhost:3000/` inspected in a 390 px responsive frame.
- The hero uses a single balanced composition for UI direction and frontend production. Real project work is reached through the dedicated, readable work archive rather than compressed into the first view.

## Checks

- No generic illustration, browser chrome, or synthetic project UI appears in the hero.
- Primary hero type, CTAs, navigation, instrument labels and moving signal remain readable at both inspected widths.
- GSAP drives the instrument as one staged scene: type arrival, construction sweep, pointer depth and a scrubbed scroll transformation. The former signal widget has been replaced by the orbital system itself: it begins behind UI × FE, rotates continuously, and follows the former signal's intentional full-page scroll journey.
- The transparent header enters with the scene, then stays sticky and condenses to a legible glass surface after the page begins scrolling.
- Six verified project links render in the dedicated archive.
- Browser console: no warnings or errors.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed.

## Result

passed
# Adaptive orbital system

- Restored the hero's original two-ring proportions: a 74% outer orbit and 50% inner orbit, without a centre marker or axis lines.
- The rings retain their independent 16s / 11s rotations while following a deliberate left–centre–right scroll route.
- `mix-blend-mode: difference` makes only the drawn ring pixels invert against the section beneath them; a ring can therefore be light over a dark area and dark over a light area at the same time.
