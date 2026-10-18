# Third-party notice

## Destination lettering

`src/experience/destination-font.json` is a character subset of the Gentilis regular typeface distributed with Three.js, renamed UKD Destination Serif. Copyright (c) 2003–2008, SIL International; designers J. Victor Gaultney and Annie Olsen. The complete SIL Open Font License 1.1 and original copyright information are retained in the JSON's readable `original_font_information` metadata. This font is used only to generate the solid destination lettering. The new artwork geometry is authored for this project.

## Historical architecture attribution

The spatial interaction architecture in this project was informed by the public source code of **ITom Dev | Interactive 3D WebGL Portfolio** by Tomasz Szmajda (`ITomPoland/portfolio-itom`). That source code is licensed under the MIT License.

Copyright (c) 2026 Tomasz Szmajda

Permission is hereby granted, free of charge, to any person obtaining a copy of the software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the MIT conditions.

No ITom personal textures, images, copy, audio, branding or other excluded personal assets are included in this Usman Khair Din build.

## Exterior environment imported from UKD

The runtime facade modules under `public/assets/city/apartments/` are reduced from Poly Haven's **Modular Urban Apartments Facade** by **James Ray Cock**, CC0 1.0: https://polyhaven.com/a/modular_urban_apartments_facade . Only runtime geometry and its referenced 1K texture maps are included. Close buildings use the source geometry; distant detail follows the same building dimensions and material families.

The local beach diffuse and normal maps are Poly Haven's **Aerial Beach 01** by **Rob Tuytel**, CC0: https://polyhaven.com/a/aerial_beach_01 . Waves, coastal geometry and water normals are authored analytic shaders, not recorded footage. No repeated water-normal image is included in the ocean runtime.

`public/assets/sky/milky-way-thilina-6000.jpg` is the user's supplied **Thilina Alagiyawanna / Pexels** Milky Way photograph, retained at its full original 6000 x 4000 resolution. The original embedded metadata identifies the photographer; the supplied filename identifies Pexels image 36833549. Pexels licence: https://www.pexels.com/license/ . The full photograph is retained, with no generative edits or crop. Runtime sky projection adds brightness adjustment, dark-level matching, an image-derived central-cloud mask and soft alpha fading in front of the corridor entrance at a raised angle, with proportionally enlarged projection scale and 40% opacity. The exterior displays a photographer credit. Detailed provenance is in `public/assets/sky/SOURCES.md`. `moon-surface.webp` is the local conversion of the Three.js example lunar map, distributed under the Three.js MIT license: https://github.com/mrdoob/three.js/blob/dev/LICENSE . The stars and Moon lighting are authored real-time effects.

The compact trees under `public/assets/forest/` reuse UKD's six prepared crown forms from Poly Haven's CC0 **Tree Small 02** (Rico Cilliers) and **Island Tree 01** (Rob Tuytel and Rico Cilliers). Only the runtime geometry tiers and referenced textures are included; full attribution and regeneration details are in `public/assets/forest/CREDITS.md`.

The forest's binary views use **meshoptimizer** lossless compression, copyright (c) 2016–2026 Arseny Kapoulkine, MIT License: https://github.com/zeux/meshoptimizer . The runtime decoder is the MIT-licensed copy distributed with Three.js; the encoder is a development dependency. The decoded geometry bytes are unchanged.

The airport's facade maps in `public/assets/environment/` are Poly Haven's **Beige Wall 001**, photography by **Dimitrios Savva** and processing by **Rico Cilliers**, CC0: https://polyhaven.com/a/beige_wall_001 . The airfield architecture is project-authored geometry imported from UKD.

The two parked aircraft share the **Cessna 172** contributed by **Boba3d** and modified by **Greg Sullivan**: https://github.com/GLSullivan/cessna/blob/e7982c365af03c6d9c34444503611c2f1aed88ad/README.md . The upstream README states that the project is MIT licensed; that repository has no separate license file. Geometry, cabin and civil livery are retained, with embedded textures reduced to 1K. Precise provenance and regeneration details are in `public/assets/city/airport/SOURCES.md`.

The parked rooftop aircraft is **Bell 206 JetRanger** by **terran4627**, **CC BY 4.0**: https://sketchfab.com/3d-models/bell-206-jetranger-d2f7ba1d671549d4b26aaf834139a1dd . License: https://creativecommons.org/licenses/by/4.0/ . The GLB was obtained from God's Eye View, which preserves the original attribution and documents its geometry/material simplification, 256 px WebP texture and metre-scale orientation preparation: https://github.com/bilawalsidhu/gods-eye-view/blob/880a672b5e16ad3e41d318801d3a5203f9201923/public/models/README.md . This project retains all supplied geometry and texture bytes, bakes a 180-degree Y turn and skid-to-ground origin adjustment, and adapts cloned physical materials to rooftop night lighting. The aircraft remains at uniform 1:1 metre scale with stopped rotors. Credits, modifications, source links and checksum are retained in `public/assets/helicopter/SOURCE.md`. These credits do not imply endorsement.
