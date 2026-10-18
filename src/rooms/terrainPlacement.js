import { islandTerrainHeight } from './islandTerrain.js'

const grades=new WeakMap()

/** A level graded site on the real terrain. This module deliberately does not
 * import exteriorLayout: every renderer can use it without a plan cycle.
 * Sample the entire rotated footprint, since its uphill point need not be a
 * corner. The 2 cm grading tolerance absorbs the sub-grid curvature between
 * samples; protected flat sites retain their exact existing elevation. */
export function islandBuildingGrade(building){
  if(grades.has(building))return grades.get(building)
  const w=building.w,d=building.d,c=Math.cos(building.yaw||0),s=Math.sin(building.yaw||0)
  const nx=Math.max(1,Math.ceil(w/4)),nz=Math.max(1,Math.ceil(d/4))
  let low=Infinity,high=-Infinity
  for(let ix=0;ix<=nx;ix++)for(let iz=0;iz<=nz;iz++){
    const dx=(ix/nx-.5)*w,dz=(iz/nz-.5)*d
    const height=islandTerrainHeight(building.x+c*dx+s*dz,building.z-s*dx+c*dz)
    low=Math.min(low,height);high=Math.max(high,height)
  }
  const grade={baseY:high+(high-low>1e-8?.02:0),bottomY:low-.15}
  grades.set(building,grade)
  return grade
}
