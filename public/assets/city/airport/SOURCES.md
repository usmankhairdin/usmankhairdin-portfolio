# Island airfield sources

The two parked civilian aircraft share the **Cessna 172**, contributed by
**Boba3d** and modified by **Greg Sullivan**, from GLSullivan/cessna.

- [Original repository and published MIT license statement](https://github.com/GLSullivan/cessna/blob/e7982c365af03c6d9c34444503611c2f1aed88ad/README.md)
- [Exact source model](https://github.com/GLSullivan/cessna/blob/e7982c365af03c6d9c34444503611c2f1aed88ad/public/media/models/Cessna 172.glb)
- [MIT license text](https://opensource.org/license/mit)

The upstream README names those contributors and states the project is licensed
under MIT; the repository does not include a separate LICENSE file. UKD's source
and provenance are retained unchanged in the read-only source project.

This project's `cessna172-runtime.glb` retains all 13,927 source triangles,
31 material primitives,18 authored finishes, articulated part transforms, high-wing
silhouette, fixed landing gear, struts, propeller, cabin seats, yokes and dashboard.
The original white/red civilian livery and normal maps remain. Only embedded
images are resized to at most 1024 px and JPEG quality 82, reducing the GLB to
1,381,568 bytes. Geometry is shared by both parked aircraft. Runtime uses cloned
private night materials with subdued glazing and no parked landing lamps.
No original source model or unused aircraft alternative is copied here.

UKD's prepared root transform sets an 11 m wingspan, 8.08524 m length and 3.06084 m
height, with the lowest tyre vertex at Y=0. Runtime places tyres at apron Y=.20.
The airfield is translated with the exterior's existing coordinate frame; the
rooftop remains a grounded pedestrian experience.

Regenerate: `node scripts/prepare-island-aircraft.mjs`

Runway, taxiway, apron, markings, terminal, open maintenance hangar, control tower
and lights are project-authored UKD geometry ported into this project. Airport
building diffuse/normal maps are **Beige Wall 001**, photography by Dimitrios Savva,
processing by Rico Cilliers, [Poly Haven](https://polyhaven.com/a/beige_wall_001),
CC0. They are the exact local UKD maps in `public/assets/environment/`.
No airport photogrammetry or surveyed airport data is claimed.
