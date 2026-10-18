// UKD source metres are retained inside one compact translated airfield group.
// A lateral dry inland strip keeps the planes visible from the west roof.
export const AIRPORT_YAW=Math.PI/2
export const AIRPORT_OFFSET=Object.freeze([-1115,0,-1200])
export const AIRPORT_SITE=Object.freeze({minX:-1080,maxX:-360,minZ:580,maxZ:750,x:-720,z:665})
export const AIRPORT_RUNWAY=Object.freeze({x:-720,z:710,w:680,d:26})
export const AIRPORT_APRON_LIGHT_XS=Object.freeze([-804,-730,-650])
export const AIRPORT_PLANES=Object.freeze([{x:-772,z:644,yaw:-Math.PI/2},{x:-688,z:644,yaw:-Math.PI/2}])
export const AIRPORT_BUILDINGS=Object.freeze([
  {x:-730,z:602,y:0,w:68,d:19,h:5.2,role:'terminal'},
  {x:-844,z:626,y:0,w:30,d:28,h:8,role:'hangar'},
  {x:-668,z:602,y:0,w:7,d:7,h:15.6,role:'tower'},
])
export function isAirportReserved(x,z,padding=0){
  x-=AIRPORT_OFFSET[0];z-=AIRPORT_OFFSET[2]
  const c=Math.cos(AIRPORT_YAW),s=Math.sin(AIRPORT_YAW),sx=c*x-s*z,sz=s*x+c*z
  x=sx;z=sz
  return x>AIRPORT_SITE.minX-padding&&x<AIRPORT_SITE.maxX+padding&&z>AIRPORT_SITE.minZ-padding&&z<AIRPORT_SITE.maxZ+padding
}
export function airportPointToIsland(x,z){
  const c=Math.cos(AIRPORT_YAW),s=Math.sin(AIRPORT_YAW)
  return {x:AIRPORT_OFFSET[0]+c*x+s*z,z:AIRPORT_OFFSET[2]-s*x+c*z}
}
