import { islandDistance } from './islandLand.js'
import { GALLERY_PLOT, GALLERY_SITE } from './gallerySite.js'
import { AIRPORT_OFFSET, AIRPORT_SITE, AIRPORT_YAW } from './airportPlan.js'

// Broad overlapping rises displace the actual island surface. The asymmetric
// domain warp avoids circular hill footprints and keeps roads on gentle grades.
const hills=[[-270,130,460,440,15],[440,-150,400,360,10],[-350,690,320,280,29],[400,670,340,280,30]]
const smoothstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}
const outside=(x,z,cx,cz,hx,hz)=>Math.hypot(Math.max(0,Math.abs(x-cx)-hx),Math.max(0,Math.abs(z-cz)-hz))
const gallery={x:(GALLERY_PLOT.x0+GALLERY_PLOT.x1)/2,z:(GALLERY_PLOT.z0+GALLERY_PLOT.z1)/2,hx:(GALLERY_PLOT.x1-GALLERY_PLOT.x0)/2+65,hz:(GALLERY_PLOT.z1-GALLERY_PLOT.z0)/2+65}
const airport={x:(AIRPORT_SITE.minX+AIRPORT_SITE.maxX)/2,z:(AIRPORT_SITE.minZ+AIRPORT_SITE.maxZ)/2,hx:(AIRPORT_SITE.maxX-AIRPORT_SITE.minX)/2+45,hz:(AIRPORT_SITE.maxZ-AIRPORT_SITE.minZ)/2+45}
const c=Math.cos(AIRPORT_YAW),s=Math.sin(AIRPORT_YAW)

export function islandTerrainHeight(x,z){
  const coast=smoothstep(255,570,-islandDistance(x,z))
  if(!coast)return 0
  const galleryFlat=smoothstep(0,140,outside(x,z,gallery.x,gallery.z,gallery.hx,gallery.hz))
  const viewDistance=Math.hypot(Math.max(0,Math.abs(x-GALLERY_SITE.x)-160),Math.max(0,z-GALLERY_PLOT.z0-20))
  const viewFlat=smoothstep(0,130,viewDistance)
  const dx=x-AIRPORT_OFFSET[0],dz=z-AIRPORT_OFFSET[2]
  const airportFlat=smoothstep(0,200,outside(c*dx-s*dz,s*dx+c*dz,airport.x,airport.z,airport.hx,airport.hz))
  if(!galleryFlat||!viewFlat||!airportFlat)return 0
  const u=x+30*Math.sin(z/410),v=z+22*Math.sin(x/370)
  let height=3+2*Math.sin((u+170)/430)*Math.cos((v-120)/500)
  for(const [cx,cz,rx,rz,h]of hills)height+=h*Math.exp(-(((u-cx)/rx)**2+((v-cz)/rz)**2))
  return height*coast*galleryFlat*viewFlat*airportFlat
}

export function islandTerrainGradient(x,z,out={}){
  const step=.5
  out.x=(islandTerrainHeight(x+step,z)-islandTerrainHeight(x-step,z))/(2*step)
  out.z=(islandTerrainHeight(x,z+step)-islandTerrainHeight(x,z-step))/(2*step)
  return out
}

const n=v=>Number(v).toFixed(8)
const vec=(x,z)=>`vec2(${n(x)},${n(z)})`
// Requires EXTERIOR_COAST_GLSL's islandDistance(vec2) once before this string.
export const ISLAND_TERRAIN_GLSL=`
  float islandTerrainBoxOutside(vec2 p,vec2 centre,vec2 halfSize){return length(max(abs(p-centre)-halfSize,0.));}
  float islandTerrainHeight(vec2 p){
    float coast=smoothstep(255.,570.,-islandDistance(p));
    if(coast<=0.)return 0.;
    float galleryFlat=smoothstep(0.,140.,islandTerrainBoxOutside(p,${vec(gallery.x,gallery.z)},${vec(gallery.hx,gallery.hz)}));
    float viewDistance=length(vec2(max(0.,abs(p.x-(${n(GALLERY_SITE.x)}))-160.),max(0.,p.y-(${n(GALLERY_PLOT.z0)})-20.)));
    float viewFlat=smoothstep(0.,130.,viewDistance);
    vec2 airportDelta=p-${vec(AIRPORT_OFFSET[0],AIRPORT_OFFSET[2])};
    vec2 airportPoint=vec2(${n(c)}*airportDelta.x-${n(s)}*airportDelta.y,${n(s)}*airportDelta.x+${n(c)}*airportDelta.y);
    float airportFlat=smoothstep(0.,200.,islandTerrainBoxOutside(airportPoint,${vec(airport.x,airport.z)},${vec(airport.hx,airport.hz)}));
    if(galleryFlat<=0.||viewFlat<=0.||airportFlat<=0.)return 0.;
    vec2 q=p+vec2(30.*sin(p.y/410.),22.*sin(p.x/370.));
    float height=3.+2.*sin((q.x+170.)/430.)*cos((q.y-120.)/500.);
    ${hills.map(([x,z,rx,rz,h])=>`{vec2 delta=(q-${vec(x,z)})/${vec(rx,rz)};height+=${n(h)}*exp(-dot(delta,delta));}`).join('\n')}
    return height*coast*galleryFlat*viewFlat*airportFlat;
  }
`
