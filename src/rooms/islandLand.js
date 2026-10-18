import { GLASS_Z } from './cityPlan.js'

export const ISLAND=Object.freeze({ground:-96,coast:-1470,cityEnd:1570,glassZ:12,beach:180,centerX:-550,centerZ:-12})
export const ISLAND_SHIFT_X=640
export const ISLAND_SHIFT_Z=GLASS_Z-12

// A fixed authored angular profile makes unequal headlands and sheltered coves.
// Third/fifth harmonics carry the landscape-scale silhouette; this is not a
// primitive outline with a noisy edge. Harmonic recurrence avoids atan/trig in
// the many CPU contour searches and per-pixel shore shader evaluations.
const harmonics=[[1,90,-1.3],[2,55,.6],[3,190,-.45],[5,105,1.1],[7,35,-.7]]
  .map(([order,amplitude,phase])=>({order,a:amplitude*Math.cos(phase),b:-amplitude*Math.sin(phase)}))
const byOrder=new Map(harmonics.map(h=>[h.order,h]))
const airportAngle=-2.3,airportC=Math.cos(airportAngle),airportS=Math.sin(airportAngle)
const frontLow=Math.cos(.6),frontHigh=Math.cos(.22)
const smoothstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}
function shoreProfile(c,s,out){
  let cn=1,sn=0,radius=1200,derivative=0
  for(let order=1;order<=7;order++){
    const nextC=cn*c-sn*s;sn=sn*c+cn*s;cn=nextC
    const h=byOrder.get(order)
    if(h){radius+=h.a*cn+h.b*sn;derivative+=order*(-h.a*sn+h.b*cn)}
  }
  // A broad polynomial headland keeps the real runway and its dry backshore.
  const airport=Math.max(0,c*airportC+s*airportS),airportDerivative=-s*airportC+c*airportS
  radius+=260*airport**8;derivative+=2080*airport**7*airportDerivative
  // Preserve the gallery beach locally; its shoulders blend into asymmetric
  // coves rather than imposing a straight coast across the whole island.
  const front=-s,t=Math.max(0,Math.min(1,(front-frontLow)/(frontHigh-frontLow)))
  const weight=t*t*(3-2*t),weightDerivative=t>0&&t<1?6*t*(1-t)*(-c)/(frontHigh-frontLow):0
  const protectedRadius=1000/Math.max(front,.3),protectedDerivative=front>.3?1000*c/(front*front):0
  out.radius=radius*(1-weight)+protectedRadius*weight
  out.derivative=derivative*(1-weight)+protectedDerivative*weight+weightDerivative*(protectedRadius-radius)
  return out
}
const profile={}
export function sourceIslandDistance(x,z){
  const dx=x-ISLAND.centerX,dz=z-ISLAND.centerZ,r=Math.hypot(dx,dz)
  if(r<=260)return r-800
  const p=shoreProfile(dx/r,dz/r,profile)
  const shore=(r-p.radius)/Math.hypot(1,p.derivative/p.radius)
  const blend=smoothstep(260,600,r)
  return (r-800)*(1-blend)+shore*blend
}
export const islandDistance=(x,z)=>sourceIslandDistance(x-ISLAND_SHIFT_X,z-ISLAND_SHIFT_Z)

const bounds={minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity},sample={}
for(let i=0;i<4096;i++){
  const angle=i*Math.PI*2/4096,c=Math.cos(angle),s=Math.sin(angle),r=shoreProfile(c,s,sample).radius
  const x=ISLAND.centerX+ISLAND_SHIFT_X+c*r,z=ISLAND.centerZ+ISLAND_SHIFT_Z+s*r
  bounds.minX=Math.min(bounds.minX,x-32);bounds.maxX=Math.max(bounds.maxX,x+32)
  bounds.minZ=Math.min(bounds.minZ,z-32);bounds.maxZ=Math.max(bounds.maxZ,z+32)
}
export const ISLAND_WORLD_BOUNDS=Object.freeze(bounds)

const n=v=>Number(v).toFixed(10)
export const SOURCE_COAST_GLSL=`
  float sourceIslandDistance(vec2 p){
    vec2 delta=p-vec2(${n(ISLAND.centerX)},${n(ISLAND.centerZ)});
    float r=length(delta);
    if(r<=260.)return r-800.;
    float c=delta.x/r,s=delta.y/r,cn=1.,sn=0.,radius=1200.,derivative=0.;
    ${Array.from({length:7},(_,i)=>{
      const order=i+1,h=byOrder.get(order)
      return `{float nextC=cn*c-sn*s;sn=sn*c+cn*s;cn=nextC;${h?`radius+=(${n(h.a)})*cn+(${n(h.b)})*sn;derivative+=${n(order)}*(-(${n(h.a)})*sn+(${n(h.b)})*cn);`:''}}`
    }).join('\n')}
    float airport=max(0.,c*(${n(airportC)})+s*(${n(airportS)}));
    float airportDerivative=-s*(${n(airportC)})+c*(${n(airportS)});
    float airport2=airport*airport,airport4=airport2*airport2;
    radius+=260.*airport4*airport4;
    derivative+=2080.*airport4*airport2*airport*airportDerivative;
    float front=-s,t=clamp((front-(${n(frontLow)}))/((${n(frontHigh)})-(${n(frontLow)})),0.,1.);
    float weight=t*t*(3.-2.*t);
    float weightDerivative=t>0.&&t<1.?6.*t*(1.-t)*(-c)/((${n(frontHigh)})-(${n(frontLow)})):0.;
    float protectedRadius=1000./max(front,.3),protectedDerivative=front>.3?1000.*c/(front*front):0.;
    derivative=derivative*(1.-weight)+protectedDerivative*weight+weightDerivative*(protectedRadius-radius);
    radius=radius*(1.-weight)+protectedRadius*weight;
    float angularSlope=derivative/radius;
    float shore=(r-radius)/sqrt(1.+angularSlope*angularSlope);
    return mix(r-800.,shore,smoothstep(260.,600.,r));
  } bool cityLand(vec2 p){return sourceIslandDistance(p)<-180.;}
`
export const EXTERIOR_COAST_GLSL=SOURCE_COAST_GLSL.slice(0,SOURCE_COAST_GLSL.indexOf(' bool cityLand'))+`
  float islandDistance(vec2 p){return sourceIslandDistance(p-vec2(${n(ISLAND_SHIFT_X)},${n(ISLAND_SHIFT_Z)}));}
  bool cityLand(vec2 p){return islandDistance(p)<-180.;}
`
