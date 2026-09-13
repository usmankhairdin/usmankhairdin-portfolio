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
- The instrument has a staged, noticeable entrance (type reveal, orbit lock, construction sweep), continuous orbit/scan motion, pointer-parallax and scroll motion; the signal begins inside its visual system and travels across the entire page with high contrast over light and dark surfaces.
- Six verified project links render in the dedicated archive.
- Browser console: no warnings or errors.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed.

## Result

passed
