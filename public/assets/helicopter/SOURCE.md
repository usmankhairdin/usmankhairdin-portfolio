# Bell 206 JetRanger rooftop aircraft

**Bell 206 JetRanger** by **terran4627**, licensed under **Creative Commons
Attribution 4.0 International (CC BY 4.0)**.

- Original creator: https://sketchfab.com/terran4627
- Original work: https://sketchfab.com/3d-models/bell-206-jetranger-d2f7ba1d671549d4b26aaf834139a1dd
- License: https://creativecommons.org/licenses/by/4.0/
- License legal text: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Downloaded from God's Eye View, whose attribution README separately preserves
  the work's CC BY 4.0 license, creator, source, and modifications:
  https://github.com/bilawalsidhu/gods-eye-view/blob/880a672b5e16ad3e41d318801d3a5203f9201923/public/models/README.md
- Download URL:
  https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/880a672b5e16ad3e41d318801d3a5203f9201923/public/models/bell206.glb
- Download date: 2026-10-18.

This credit identifies the original creator and source, links the license, and
describes changes. It does not imply endorsement by the creator or Bell.

## Preparation and modifications

God's Eye View prepared the source as a real-world metre-scale, Y-up GLB,
centred its origin, baked its nose toward -X, simplified geometry/materials,
and resized its texture to a 256 px WebP. We retain that supplied texture
without upsampling and retain every supplied vertex and triangle.

For this project, vertex positions and normals were turned 180 degrees about
Y so the nose faces +X; vertex positions were raised by 1.6557531356811523 m
so both landing skids touch Y=0. Mesh/material names were clarified. Original
creator, license, title and source metadata remain embedded in the GLB. No
geometry was added or removed and the original texture bytes are unchanged.

The runtime uses the prepared GLB at a uniform scale of **1.0**, at the pad
centre, with its skid bottoms on the terrace plane at Y=-0.075. Its nose faces
the gallery at a 30-degree angle. The main and tail rotor geometry remain
stationary. Runtime material clones retain the authored livery, UVs and normals,
with painted-airframe clearcoat, tinted physical glazing, and cool moon/sky
illumination matched to the exterior. Two visible wall-mounted floodlights
on the rear stone piers illuminate the aircraft and the deck with the same
shared positions, cones, colours and attenuation. Soft deck occlusion and tight
skid shadows anchor the landing gear. No flight or interaction is added.

## Asset inspection

- Runtime file: `bell206-jetranger.glb`, 321,028 bytes.
- SHA-256: `eb56b025fdf4c5ca52c7c21e1576594592a756036af2fffa134f2577fb4ce429`
- Geometry: 2 meshes, 8,698 supplied vertices, 6,014 triangles.
- Materials: separate cabin glazing and painted airframe, with one embedded
  WebP livery texture and no external resources.
- Prepared bounds: X -5.950 to +5.950 m, Y 0 to 3.311506 m,
  Z -5.455727 to +5.455727 m.
- Actual maximum horizontal vertex radius is 5.952489 m, leaving over 2 m
  of clearance to the painted helipad ring.
- Details include the actual Bell 206 exterior proportions, glazing, cabin,
  tapered tail, stabilizer, tail rotor, stopped main rotor and skid landing gear.
  The source creator describes the interior as less detailed than the exterior.

Placement and collision share `src/rooms/helicopterPlacement.js`. Collision
follows the cabin/skids, narrow tail boom and stabilizer; the overhead main
rotor does not block walking across the whole pad. The placement tests parse
the production GLB and check all vertices against the pad and roof, both skid
contacts against the deck, collision, walking and return routes.
