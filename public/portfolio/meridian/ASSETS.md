# Meridian — imagery, type, and software credits

## Earth maps

Planet textures by **Solar System Scope / INOVE**, licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

- Original library and reuse terms: https://www.solarsystemscope.com/textures/
- License: https://creativecommons.org/licenses/by/4.0/
- Source distribution mirror: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets
- Mirror attribution: https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_tsl_earth.html

Source files acquired October 22, 2026:

| Distributed source                   | Local derivative                    | Treatment                              |
| ------------------------------------ | ----------------------------------- | -------------------------------------- |
| earth_day_4096.jpg                   | textures/day.webp                   | Resize to 2048 × 1024; WebP quality 88 |
| earth_day_4096.jpg                   | textures/day-high.webp              | 4096 × 2048; WebP quality 90; desktop  |
| earth_night_4096.jpg                 | textures/night.webp                 | Resize to 2048 × 1024; WebP quality 83 |
| earth_night_4096.jpg                 | textures/night-high.webp            | 4096 × 2048; WebP quality 87; desktop  |
| earth_bump_roughness_clouds_4096.jpg | textures/bump_roughness_clouds.webp | Resize to 2048 × 1024; WebP quality 83 |

The attributed mirror contains resized day/night imagery and a merged data texture derived from the same Solar System Scope set. The merged channels encode bump (R), land/ocean roughness (G), and clouds (B). All three maps use the same equirectangular registration. Geographic checks used Africa, Europe, the Americas, Asia, and polar regions. Surface shading uses G for water reflectivity and B for cloud coverage. It does not infer water from blue pixels or elevation from albedo brightness. Bump is deliberately unused: the silhouette stays spherical and smooth.

`textures/earth-poster.webp` is a project-generated 768 × 768 static photographic sphere projection derived from the day and cloud maps, with alpha and restrained lighting. It shares the CC BY 4.0 attribution. Derivatives have been resized, compressed, composited and lit; no endorsement by the source is implied. `scripts/make-poster.mjs` records the projection method.

Color treatment: day/night are sRGB color textures; merged numerical data uses NoColorSpace. Lighting is evaluated in linear space. A Three.js r180 RenderPass → UnrealBloomPass → OutputPass chain applies bloom to the WebGL scene and performs the final ACES/display conversion once. HTML is composited separately. There is no normal displacement, downloaded planet model, or shipped reference-site asset package.

## Typeface licenses

- **DM Sans**, Colophon Foundry / the DM Sans project authors. https://github.com/google/fonts/tree/main/ofl/dmsans
- **Instrument Serif Italic**, Rodrigo Fuenzalida / the Instrument Serif project authors. https://github.com/google/fonts/tree/main/ofl/instrumentserif

Both are self-hosted under the **SIL Open Font License 1.1**. Full license notices are included at `fonts/DM-Sans-OFL.txt` and `fonts/Instrument-Serif-OFL.txt`. The cinematic revision uses DM Sans only; Instrument Serif is retained from the earlier direction and is not requested by the current CSS. No third-party font network request is required.

## UI, brand, and code

The Meridian wordmark symbol, interface compositions, copy, chart, diagrams, and motion system were authored for this original portfolio project. The cinematic direction is informed by the user-supplied Ascend recordings from GetLayers: https://www.getlayers.ai/templates?layer=ascend . The original Meridian identity, product, copy, and functional UI are retained. Player/device/catalogue wrappers and template binaries are not page assets.

Candidate `planet.glb`, `planet-lights.glb`, and `planet-clouds.png` files were inspected as metadata only. The GLB uses Draco geometry and 6000px square WebP maps; lights use a 4000px map. Their asset-specific reuse entitlement was not established. The lighter, attributed equirectangular maps above were selected instead. See `artifacts/reference/asset-inspection.json`.

- React — MIT: https://github.com/facebook/react/blob/main/LICENSE
- Three.js r180 — MIT: https://github.com/mrdoob/three.js/blob/r180/LICENSE
- Lucide icons — ISC: https://github.com/lucide-icons/lucide/blob/main/LICENSE
- Vite and Vitest — MIT; TypeScript — Apache 2.0.

All opportunity names, people, values, workflow states, and plan prices are illustrative. Email addresses use the reserved `.example` domain. Integration names are categories rather than partnership claims. There are no customer endorsements, real infrastructure locations, or data residency claims.
