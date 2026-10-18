# Island tree sources and native runtime geometry

- Tree Small 02 (Burkea africana): Rico Cilliers, [Poly Haven](https://polyhaven.com/a/tree_small_02), CC0.
- Island Tree 01: Rob Tuytel (scanning/processing), Rico Cilliers (cleanup/processing), [Poly Haven](https://polyhaven.com/a/island_tree_01), CC0.

The read-only UKD sources supply six authored crown forms of these two species.
The native geometry of each species is shared by its three crown profiles.
The profile deformation is applied to bark, branches and foliage together in
the instanced vertex shader. Younger trees lower their first crown naturally,
while mature trees keep the original scanned tree structure.

The close tier retains all 30,250 Burkea and 44,168 coastal curved leaf contours
at their native size, together with the connected source branch geometry.
The middle tier retains 6,000 native-size source leaf contours plus complete
small branch clusters for density. The former sparse-leaf enlargement is removed;
individual leaves are never inflated to stand in for an entire branch.

Every one of the original 30,250 Burkea leaves and 44,168 coastal leaves contributes
to both branch-cluster tiers. The medium forest bake rasterizes actual geometry,
photographic colours and alpha into 45/66 spatial branch clusters with three
orthogonal views each. The distant grove tier uses 13/18 larger spatial clusters
and source wood. These are pieces of the original three dimensional
crown. Cluster lighting uses a smooth crown envelope to avoid visible planar
lighting bands. Crown extents are scaled consistently across all tiers.

Every tier also retains the same 216-triangle continuous structural bark mesh:
an irregular embedded root flare, tapered stem and scanned trunk bend. The
coarse wood keeps 110 source vertices per branch/trunk part; it is no longer
collapsed into the former 18-vertex distant sticks. This bark is actual tree
geometry, with no soil cone or separate dirt mound under each placement.

The variants use 183,996 / 267,218 close, 37,421 / 37,417 middle, 849 / 922
medium forest and 657 / 634 distant grove triangles. The two species share
25,381,868 bytes of binary geometry across all six crown forms. The runtime
budget and close reservation are defined in `src/rooms/islandTreePlan.js`.
Existing visible silhouettes keep capacity when the visitor turns their head.
The complete source forest pack is not copied. Bark diffuse maps are 512 px,
near leaf atlases 768 px, medium branch atlases at most 1024 px and distant grove
atlases at most 768 px. Geometry and materials are shared through instancing.

Planting mixes mature overlapping coastal forest, woodland fingers, world-space
garden clusters, street planting and inland parks. Height, breadth, rotation
and crown form vary across the island. Roots follow the actual rendered terrain
mesh, preserving streets, homes, the gallery sea view and the runway.

Regenerate from the original read-only source directories with:

`node scripts/prepare-island-trees.mjs D:/UKD/public/assets/forest`

The script reads UKD's `natural-trees` model and `.artifacts/forest-broadleaf`
and `.artifacts/forest-coastal` scans, then runs the local texture compactor.
It uses the already bundled Sharp image library. `*-canopy-metrics.json` and
`*-grove-metrics.json` record full source leaf coverage before texture resizing.
There are no runtime requests to Poly Haven. Shapes and planting are authored
landscape design, not a surveyed or geographically accurate forest.

Runtime buffer views use lossless `EXT_meshopt_compression`. No vertex,
normal, UV, or index bytes are quantized or reordered. The build-time
encoder is meshoptimizer (MIT); Three.js provides the runtime decoder.
`scripts/compress-gltf.mjs` is also run by the tree preparation script.
