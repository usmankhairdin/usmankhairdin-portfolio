import {GLASS_Z} from './cityPlan.js'
import {islandTerrainHeight} from './islandTerrain.js'

export const ISLAND_GROUND_SIZE=5200
export const ISLAND_GROUND_SEGMENTS=520
const step=ISLAND_GROUND_SIZE/ISLAND_GROUND_SEGMENTS,half=ISLAND_GROUND_SIZE/2

// Contact points use the surface actually rasterized by PlaneGeometry. The
// analytic hill is sampled at mesh vertices; using it between them can leave
// a tree root a few centimetres above one of the large ground triangles.
export function islandRenderedTerrainHeight(x,z){
  const cellX=Math.floor((x+half)/step),cellZ=Math.floor((z-GLASS_Z+half)/step)
  const x0=cellX*step-half,z0=cellZ*step-half+GLASS_Z,u=(x-x0)/step,v=(z-z0)/step
  const a=islandTerrainHeight(x0,z0),b=islandTerrainHeight(x0+step,z0),c=islandTerrainHeight(x0,z0+step)
  if(u+v<=1)return a+(b-a)*u+(c-a)*v
  const d=islandTerrainHeight(x0+step,z0+step)
  return d+(c-d)*(1-u)+(b-d)*(1-v)
}

// Requires ISLAND_TERRAIN_GLSL. The diagonal is the same a/b/d, b/c/d split
// used by Three.js PlaneGeometry after rotation onto the XZ plane.
export const ISLAND_TERRAIN_MESH_GLSL=`
  float islandRenderedTerrainHeight(vec2 p){
    vec2 origin=vec2(-${half.toFixed(8)},${(GLASS_Z-half).toFixed(8)});
    vec2 cell=floor((p-origin)/${step.toFixed(8)}),corner=origin+cell*${step.toFixed(8)},uv=(p-corner)/${step.toFixed(8)};
    float a=islandTerrainHeight(corner),b=islandTerrainHeight(corner+vec2(${step.toFixed(8)},0.)),c=islandTerrainHeight(corner+vec2(0.,${step.toFixed(8)}));
    if(uv.x+uv.y<=1.)return a+(b-a)*uv.x+(c-a)*uv.y;
    float d=islandTerrainHeight(corner+vec2(${step.toFixed(8)}));
    return d+(c-d)*(1.-uv.x)+(b-d)*(1.-uv.y);
  }
`
