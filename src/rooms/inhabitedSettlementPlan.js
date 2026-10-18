import { landscapeHash } from './settlementPlan.js'

export const RESIDENTIAL_KINDS=Object.freeze(['house','villa','townhouse'])

/** The complete site, including eaves, porch, access steps and school court.
 * Kept in exteriorLayout.boxes so trees and the generic OBB clearance test see
 * exactly the footprint reserved by the specialized architecture renderer. */
export function inhabitedSite({id,x,z,w,d,yaw,density,kind='house',seed=0,sourceX,sourceZ}){
  const residential=RESIDENTIAL_KINDS.includes(kind)
  const storeys=kind==='house'?(seed>.68?2:1):kind==='villa'?2:kind==='townhouse'?(seed>.86?3:2):kind==='clinic'?2:kind==='school'?2:1
  const bodyW=w-2.1,bodyD=d-(kind==='school'?21:kind==='court'?2:5.4)
  const bodyH=kind==='court'?.2:storeys*(residential?3.05:3.45)
  const roofShape=kind==='house'?(seed<.43?'gable':'hip'):kind==='villa'?'cross-gable':kind==='townhouse'?'gable':kind==='shop'||kind==='market'?'canopy':kind==='court'?'open':'hip'
  const roofRise=roofShape==='open'?.1:roofShape==='canopy'?1.2:Math.min(3.3,bodyW*.2)
  const roofTones=['#754d3b','#5b6669','#835a47','#626160','#4a5859']
  const wallTones=['#c7c3ae','#d9d4c1','#b9c4be','#cfbba2','#a8b4b3','#c8c7ba']
  return {id,x,z,w,d,yaw,y:0,h:kind==='court'?1.65:bodyH+roofRise,anchor:[x,z],sourceAnchor:[sourceX,sourceZ],density,
    settlementKind:kind,storeys,bodyW,bodyD,bodyH,roofRise,roofShape,seed,
    roofColor:roofTones[Math.floor(seed*roofTones.length)%roofTones.length],
    wallColor:wallTones[Math.floor(landscapeHash(x,z,410)*wallTones.length)],
    frontDoor:{x:kind==='townhouse'?-bodyW*.28:bodyW*.13,y:.25,w:1.05,h:2.15,z:bodyD*(kind==='villa'?.46:.5)+.12},
    a:[seed,3,3.05,3],b:[.22,.9,0,0]}
}
