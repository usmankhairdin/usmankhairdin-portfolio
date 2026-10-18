import { islandBuildingGrade } from './terrainPlacement.js'
import { islandRenderedTerrainHeight } from './islandTerrainMesh.js'

const plans=new WeakMap()

/** A flight across the front garden, from actual rendered soil to the level
 * pad. Its top landing can step inward onto clear garden paving; a side flight
 * would otherwise terminate against the side wall of a small detached home. */
export function inhabitedAccessPlan(site){
  if(plans.has(site))return plans.get(site)
  const grade=islandBuildingGrade(site),front=site.d/2,z=front-.56,startX=-site.w/2+.48
  const c=Math.cos(site.yaw),s=Math.sin(site.yaw)
  const world=(x,z)=>({x:site.x+c*x+s*z,z:site.z-s*x+c*z})
  const foot={x0:startX-.38,x1:startX,z0:z-.47,z1:z+.47}
  const ground=[]
  for(const x of [foot.x0,foot.x1])for(const pz of [foot.z0,foot.z1]){
    const p=world(x,pz);ground.push(islandRenderedTerrainHeight(p.x,p.z))
  }
  const startY=Math.max(...ground)+.012,rise=grade.baseY-startY
  if(rise<.24){plans.set(site,null);return null}
  let endLimit=site.w/2-.15
  const w=site.bodyW
  if(site.settlementKind==='townhouse'){
    const units=Math.max(3,Math.round(w/7.5)),unit=w/units
    endLimit=-(units-1)*unit/2+unit*.15-1.375-.12
  }else if(site.settlementKind==='villa')endLimit=w*.13-2.375-.12
  else if(site.settlementKind==='house')endLimit=w*.13-1.825-.12
  // The school flight is in front of the playground (whose near edge is
  // front-1.35), not beside it. Constraining it to the narrow side gap made
  // compact accepted campuses reject otherwise safe full-depth treads.
  else if(site.settlementKind==='school')endLimit=-Math.min(w*.1,3)
  else if(site.settlementKind==='clinic')endLimit=-w*.29-.2
  else if(site.settlementKind==='shop')endLimit=-w*.15
  else if(site.settlementKind==='market')endLimit=-w*.15
  else if(site.settlementKind==='court')endLimit=-1.5
  const count=Math.ceil(rise/.175),landingLength=.6
  const tread=Math.min(.28,(endLimit-startX-landingLength)/count)
  if(tread<.25)throw new Error(`A safe access flight does not fit ${site.id}`)
  const bottomY=Math.min(grade.bottomY,Math.min(...ground)-.15)
  foot.y0=bottomY;foot.y1=startY
  const steps=Array.from({length:count},(_,i)=>({x0:startX+i*tread,x1:startX+(i+1)*tread,z0:z-.47,z1:z+.47,y0:bottomY,y1:startY+rise*(i+1)/count}))
  const endX=startX+count*tread
  const landing={x0:endX,x1:endX+landingLength,z0:front-1.14,z1:z+.5,y0:bottomY,y1:grade.baseY}
  const cutout={x0:foot.x0-.02,x1:landing.x1+.02,z0:front-1.12,z1:front}
  const plan={foot,steps,landing,cutout,bottomY,startY,topY:grade.baseY,rise,tread,
    // The last short segment crosses the cutout edge into an unbroken level
    // garden strip, before continuing toward the original porch steps.
    exit:[{x:(landing.x0+landing.x1)/2,z},{x:(landing.x0+landing.x1)/2,z:cutout.z0-.12}]}
  plans.set(site,plan)
  return plan
}
