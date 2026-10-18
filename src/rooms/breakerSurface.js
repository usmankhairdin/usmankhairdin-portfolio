import { coastEventAt,coastSurfaceAt,controlNoise } from './coastSurface.js'
import { islandDistance } from './islandLand.js'
import { GLASS_Z } from './cityPlan.js'

const clamp=x=>Math.max(0,Math.min(1,x))
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)}
const CENTER=[90,GLASS_Z-24]

// Solve on the same ordered island-centre rays as the base mesh. Extending
// noisy shoreline normals offshore can reverse neighbouring sections.
export function breakerPositionAt(x,z,target){
  const rx=x-CENTER[0],rz=z-CENTER[1],rest=Math.hypot(rx,rz),nx=rx/rest,nz=rz/rest
  let radius=rest+target
  for(let i=0;i<4;i++){
    const px=CENTER[0]+nx*radius,pz=CENTER[1]+nz*radius
    const distance=islandDistance(px,pz)
    const slope=islandDistance(px+nx*.5,pz+nz*.5)-islandDistance(px-nx*.5,pz-nz*.5)
    radius=Math.max(rest-500,Math.min(rest+500,radius-(distance-target)/Math.max(slope,.25)))
  }
  return {x:CENTER[0]+nx*radius,z:CENTER[1]+nz*radius}
}

// A swept cross-section, including the inner face of the spilling lip. X is
// shore-normal metres; Y is normalized height. It cannot be a height map.
export const BREAKER_PROFILE=Object.freeze([
  [-38,0],[-16,0],[-1,.45],[-7,.74],[-11,.84],[-8,1.03],[0,1],[22,.42],[44,0],[58,0],
].map(Object.freeze))

export function breakerProfileAt(u,breaking=1){
  const n=BREAKER_PROFILE.length-1,scaled=clamp(u)*n,i=Math.min(n-1,Math.floor(scaled)),t=scaled-i
  const p0=BREAKER_PROFILE[Math.max(0,i-1)],p1=BREAKER_PROFILE[i],p2=BREAKER_PROFILE[i+1],p3=BREAKER_PROFILE[Math.min(n,i+2)]
  const value=axis=>.5*((2*p1[axis])+(-p0[axis]+p2[axis])*t+(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*t*t+(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*t*t*t)
  const derivative=axis=>.5*((-p0[axis]+p2[axis])+2*(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*t+3*(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*t*t)*n
  const raw=value(1),flat=-38+96*u
  return {offset:flat+(value(0)-flat)*breaking,height:Math.max(0,raw),dOffset:96+(derivative(0)-96)*breaking,dHeight:raw>0?derivative(1):0}
}

// The inactive edges sit below the base sea. Drawing a second opaque coplanar
// sheet here creates a sharp rectangular shelf, even when its height is zero.
export function breakerLiftAt(u,height,breaking=1,strength=1){
  const profile=breakerProfileAt(u,breaking),s=clamp(profile.height/.12)
  const join=s*s*(3-2*s),joinSlope=s>0&&s<1?6*s*(1-s)/.12:0
  return {lift:height*profile.height-.36*(1-join)-.65*(1-smooth(0,.2,strength)),slope:(height+.36*joinSlope)*profile.dHeight}
}

export function breakerSpillAt(x,z,time,index=0,seed=0){
  return coastEventAt(x,z,time,index,seed).spill
}

export function breakerWaveAt(x,z,time,index,seed=0){
  return coastEventAt(x,z,time,index,seed)
}

export function breakerFoamEnvelope(delta,breaking,strength){
  const wash=smooth(-78,-42,delta)*(1-smooth(-12,12,delta))*Math.exp(-Math.max(-delta-18,0)/80)
  const spill=Math.exp(-((delta+10)**2)/260)
  const residue=.1*smooth(0,8,delta)*Math.exp(-Math.max(delta,0)/18)
  return (wash*.8+spill*.6+residue)*(.12+.88*breaking)*strength
}

export const breakerLipAt=(u,breaking,strength=1)=>smooth(.30,.43,u)*(1-smooth(.62,.76,u))*breaking*smooth(0,.35,strength)

export function breakerFoamAt(x,z,time,d,{seed=0}={}){
  const coverage=coastSurfaceAt(x,z,time,d,{seed}).coverage
  if(coverage===0||d>420)return 0
  const shore=breakerPositionAt(x,z,0)
  let envelope=0
  for(let i=0;i<3;i++){
    const w=breakerWaveAt(shore.x,shore.z,time,i,seed),delta=d-w.center
    const boreDelta=d-w.front,bore=smooth(-1,4,boreDelta)*(1-smooth(32,70,boreDelta))*w.bore
    envelope=Math.max(envelope,breakerFoamEnvelope(delta,w.breaking,w.foamStrength),bore)
  }
  const grain=.55*controlNoise(x*.14-time*.18,z*.14+time*.09,seed^821).value+.45*controlNoise(x*.39+time*.11,z*.39-time*.07,seed^822).value
  return clamp(envelope*(.34+.66*smooth(.22,.72,grain))*coverage*(1-smooth(330,420,d)))
}

const point=p=>`vec2(${p[0].toFixed(6)},${p[1].toFixed(6)})`
export const BREAKER_SURFACE_GLSL=`
  const vec2 breakerCenter=vec2(${CENTER.map(v=>v.toFixed(6)).join(',')});
  vec2 breakerPosition(vec2 restPoint,float target){
    vec2 offset=restPoint-breakerCenter;float rest=length(offset);vec2 ray=offset/rest;float radius=rest+target;
    for(int i=0;i<4;i++){
      vec2 p=breakerCenter+ray*radius;float distance=islandDistance(p);
      float slope=islandDistance(p+ray*.5)-islandDistance(p-ray*.5);
      radius=clamp(radius-(distance-target)/max(slope,.25),rest-500.,rest+500.);
    }
    return breakerCenter+ray*radius;
  }
  vec2 breakerControl(int i){
    ${BREAKER_PROFILE.map((p,i)=>`if(i==${i})return ${point(p)};`).join('\n')}
    return ${point(BREAKER_PROFILE.at(-1))};
  }
  vec4 breakerProfile(float u,float breaking){
    float scaled=clamp(u,0.,1.)*9.;int i=min(8,int(floor(scaled)));float t=scaled-float(i);
    vec2 a=breakerControl(max(0,i-1)),b=breakerControl(i),c=breakerControl(i+1),d=breakerControl(min(9,i+2));
    vec2 value=.5*(2.*b+(-a+c)*t+(2.*a-5.*b+4.*c-d)*t*t+(-a+3.*b-3.*c+d)*t*t*t);
    vec2 slope=.5*((-a+c)+2.*(2.*a-5.*b+4.*c-d)*t+3.*(-a+3.*b-3.*c+d)*t*t)*9.;
    if(value.y<=0.){value.y=0.;slope.y=0.;}
    return vec4(mix(-38.+96.*u,value.x,breaking),value.y,mix(96.,slope.x,breaking),slope.y);
  }
  vec2 breakerLift(vec4 profile,float height,float strength){
    float s=clamp(profile.y/.12,0.,1.),join=s*s*(3.-2.*s);
    float slope=s>0.&&s<1.?6.*s*(1.-s)/.12:0.;
    return vec2(height*profile.y-.36*(1.-join)-.65*(1.-smoothstep(0.,.2,strength)),(height+.36*slope)*profile.w);
  }
  float breakerSpill(vec2 p,float t,float index){
    return coastEvent(p,t,index).spill;
  }
  #define BreakerWave CoastEvent
  BreakerWave breakerWave(vec2 p,float t,float index){
    return coastEvent(p,t,index);
  }
  float breakerFoamEnvelope(float delta,float breaking,float strength){
    float wash=smoothstep(-78.,-42.,delta)*(1.-smoothstep(-12.,12.,delta))*exp(-max(-delta-18.,0.)/80.);
    float front=delta+10.,spill=exp(-front*front/260.);
    float residue=.1*smoothstep(0.,8.,delta)*exp(-max(delta,0.)/18.);
    return (wash*.8+spill*.6+residue)*(.12+.88*breaking)*strength;
  }
  float breakerLip(float u,float breaking,float strength){return smoothstep(.30,.43,u)*(1.-smoothstep(.62,.76,u))*breaking*smoothstep(0.,.35,strength);}
  float breakerFoam(vec2 p,float d,float t,float coverage){
    if(coverage<=0.||d>420.)return 0.;
    vec2 shore=breakerPosition(p,0.);
    float envelope=0.;
    for(int i=0;i<3;i++){
      BreakerWave w=breakerWave(shore,t,float(i));float delta=d-w.center;
      float boreDelta=d-w.front.x,bore=smoothstep(-1.,4.,boreDelta)*(1.-smoothstep(32.,70.,boreDelta))*w.bore;
      envelope=max(envelope,max(breakerFoamEnvelope(delta,w.breaking,w.foamStrength),bore));
    }
    float grain=.55*seaControl(p*.14+vec2(-t*.18,t*.09),821u).x+.45*seaControl(p*.39+vec2(t*.11,-t*.07),822u).x;
    return clamp(envelope*(.34+.66*smoothstep(.22,.72,grain))*coverage*(1.-smoothstep(330.,420.,d)),0.,1.);
  }
  float surfFroth(vec2 p,float t,float footprint){
    vec2 warp=vec2(coastFoamNoise(p*.043+vec2(t*.013,0.)),coastFoamNoise(p*.051+vec2(4.,-t*.017)));
    vec2 flow=p+warp*17.+vec2(t*.27,-t*.19);
    float mass=coastFoamNoise(flow*.095),grain=coastFoamNoise(flow*.63);
    float lace=1.-smoothstep(.035,.19,abs(grain-.5));
    float resolved=1.-smoothstep(.5,2.5,footprint);
    float coarse=mix(.57,.25+.6*smoothstep(.18,.75,mass),1.-smoothstep(2.,9.,footprint));
    return mix(coarse,clamp(.22+.55*smoothstep(.2,.72,mass)+lace*.45,0.,1.),resolved);
  }
`
