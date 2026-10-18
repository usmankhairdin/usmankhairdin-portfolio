import { GLASS_Z } from './cityPlan.js'

// The city-side sand and the connected beach use the same scanned material at
// their shared boundary. Keep lighting/grain identical there to avoid a seam.
export const COAST_SAND_GLSL=`
  float coastGrain(vec2 p){return fract(sin(dot(floor(p*.7),vec2(127.1,311.7)))*43758.5453);}
  vec3 coastSandColor(sampler2D scannedSand,vec2 p){
    vec3 scan=mix(texture2D(scannedSand,p/30.0).rgb,
      texture2D(scannedSand,mat2(.8,-.6,.6,.8)*p/83.0+vec2(.37,.61)).rgb,.28);
    return scan*vec3(.28,.29,.31)*(.94+coastGrain(p)*.06);
  }
`

// Crossing wave groups share no dominant periodic carrier. Long phase bends
// change crest spacing and direction within each travelling group; their exact
// derivatives keep the displacement and normals together at every distance.
export const OCEAN_WAVES=Object.freeze([
  [141,.58,-.91,.42,.7],
  [103,.43,-.70,-.71,2.3],
  [74,.31,-.98,-.16,4.6],
  [51,.19,-.25,.97,1.8],
  [34,.12,-.83,.55,5.1],
  [21,.075,-.42,-.91,3.7],
  [12,.04,-.99,.08,6.2],
].map(([wavelength,amplitude,x,z,phase])=>Object.freeze({wavelength,amplitude,x,z,phase})))

const TAU=Math.PI*2
const clamp=x=>Math.min(1,Math.max(0,x))
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)}
const smoothD=(a,b,x)=>{const t=clamp((x-a)/(b-a));return 6*t*(1-t)/(b-a)}
const foamHash=(x,z)=>{x-=Math.floor(x/2048)*2048;z-=Math.floor(z/2048)*2048;const h=Math.sin(x*127.1+z*311.7)*43758.5453;return h-Math.floor(h)}
function foamNoise(x,z){
  const ix=Math.floor(x),iz=Math.floor(z),fx=smooth(0,1,x-ix),fz=smooth(0,1,z-iz)
  const a=foamHash(ix,iz),b=foamHash(ix+1,iz),c=foamHash(ix,iz+1),d=foamHash(ix+1,iz+1)
  return (a+(b-a)*fx)*(1-fz)+(c+(d-c)*fx)*fz
}
export const COAST_DRY_LIMIT=-128
export const COAST_GEOMETRY_FOOTPRINT=3

// Fresh entropy per mounted visit, kept within the exact integer range of a
// highp float uniform. Tests can inject entropy and field seeds independently.
export function createOceanSeed(randomValues=array=>globalThis.crypto.getRandomValues(array)){
  const entropy=new Uint32Array(1);randomValues(entropy);return entropy[0]>>>8
}

function controlHash(x,z,seed){
  let h=(Math.imul(x,374761393)^Math.imul(z,668265263)^Math.imul(seed,2246822519))>>>0
  h=Math.imul(h^(h>>>13),1274126177)>>>0
  return ((h^(h>>>16))>>>0)/4294967295
}
export function controlNoise(x,z,seed){
  const ix=Math.floor(x),iz=Math.floor(z),tx=x-ix,tz=z-iz,fx=tx*tx*(3-2*tx),fz=tz*tz*(3-2*tz)
  const a=controlHash(ix,iz,seed),b=controlHash(ix+1,iz,seed),c=controlHash(ix,iz+1,seed),d=controlHash(ix+1,iz+1,seed)
  const bottom=a+(b-a)*fx,top=c+(d-c)*fx
  return {value:bottom+(top-bottom)*fz,dx:((b-a)*(1-fz)+(d-c)*fz)*6*tx*(1-tx),dz:(top-bottom)*6*tz*(1-tz)}
}
export function coastPhase(time,seed){
  return .62*time+1.4*(controlNoise(11+time*.045,0,seed^101).value-controlNoise(11,0,seed^101).value)
    +.7*(controlNoise(37+time*.083,0,seed^102).value-controlNoise(37,0,seed^102).value)
}

const COAST_CENTER=[90,GLASS_Z-24]
// Every point on an island-centre ray samples the same event. In particular a
// crest's identity cannot change when its vertices move towards the beach.
function coastAnchorAt(x,z){
  const x0=x-COAST_CENTER[0],z0=z-COAST_CENTER[1],radius=Math.max(Math.hypot(x0,z0),1),nx=x0/radius,nz=z0/radius
  return {x:COAST_CENTER[0]+nx*1000,z:COAST_CENTER[1]+nz*1000,xx:1000/radius*(1-nx*nx),xz:-1000/radius*nx*nz,zz:1000/radius*(1-nz*nz)}
}

// A single event carries its front through wave collapse, a travelling bore,
// then a parabolic uprush/rundown. Only the folded face loses height during
// collapse; its water and foam continue to the beach. The event's reach and
// height are frozen at birth, so a retreating waterline cannot regrow it.
export function coastEventAt(x,z,time,index,seed=0){
  const anchor=coastAnchorAt(x,z)
  const field=(sx,sz,t,salt)=>{
    const n=controlNoise(anchor.x*sx+anchor.z*sz,t,seed^salt)
    return {value:n.value,dx:n.dx*(sx*anchor.xx+sz*anchor.xz),dz:n.dx*(sx*anchor.xz+sz*anchor.zz)}
  }
  const jitter=field(.0027,.0021,time*.037,811)
  const cycle=coastPhase(time,seed)/(TAU*3)+index/3+controlNoise(5.12,9.7,seed^812).value+(jitter.value-.5)*.035
  const progress=cycle-Math.floor(cycle),waveId=Math.floor(cycle),px=jitter.dx*.035,pz=jitter.dz*.035
  const bed=field(.0015,.0011,0,303),baseline=-40+4*(bed.value-.5),bx=bed.dx*4,bz=bed.dz*4
  const range=field(.0015,.0011,waveId*.73+index*11,202),reach=40+24*range.value
  const bend=field(.009,.007,waveId*.71+index*17,813),short=field(.026,-.021,waveId*.43+index*23,817)
  const bendHeight=(bend.value-.5)*20+(short.value-.5)*12,bendX=bend.dx*20+short.dx*12,bendZ=bend.dz*20+short.dz*12
  let front,dx,dz
  if(progress<.64){
    // Match the bore's contact velocity to the swash launch velocity. The
    // alongshore bend and its velocity both vanish at contact, preventing a
    // spatially varying kink when the front becomes the shoreline.
    const u=progress/.64,s=Math.sin(Math.PI*u)**2,f=u*u*(1-u),launch=4*.64/.36
    const acceleration=reach*launch-(220-baseline)
    const slope=((baseline-220)+acceleration*(2*u-3*u*u)+bendHeight*Math.PI*Math.sin(2*Math.PI*u))/.64
    front=220+(baseline-220)*u+acceleration*f+bendHeight*s
    dx=bx*u+(range.dx*24*launch+bx)*f+bendX*s+slope*px
    dz=bz*u+(range.dz*24*launch+bz)*f+bendZ*s+slope*pz
  }else{
    const u=(progress-.64)/.36,travel=4*u*(1-u),slope=-4*reach*(1-2*u)/.36
    front=baseline-reach*travel
    dx=bx-range.dx*24*travel+slope*px;dz=bz-range.dz*24*travel+slope*pz
  }
  const birth=smooth(0,.10,progress),strength=birth*(1-smooth(.42,.64,progress))
  const bore=smooth(.42,.62,progress)*(1-smooth(.95,1,progress))
  const boreD=smoothD(.42,.62,progress)*(1-smooth(.95,1,progress))-smooth(.42,.62,progress)*smoothD(.95,1,progress)
  const size=field(.007,-.005,waveId*.73+index*11,814),height=6.4+4.8*size.value
  const broad=field(.009,.005,time*.045+index*17,815),detail=field(.029,-.023,time*.073+index*23,816)
  const spill=clamp(1.8*(broad.value-.25)+.6*(detail.value-.5))
  const breaking=clamp((1-smooth(65,195,front+10))*(.4+.7*spill))
  return {front,center:front+10,dx,dz,baseline,baselineX:bx,baselineZ:bz,height,strength,breaking,progress,waveId,spill,bore,boreX:boreD*px,boreZ:boreD*pz,foamStrength:birth*(1-smooth(.96,1,progress))}
}

function coastEventWaterAt(x,z,time,d,ddx,ddz,seed){
  let edge,ex,ez,lift=0,liftX=0,liftZ=0
  for(let i=0;i<3;i++){
    const event=coastEventAt(x,z,time,i,seed)
    if(edge===undefined){edge=event.baseline;ex=event.baselineX;ez=event.baselineZ}
    if(event.front<edge){edge=event.front;ex=event.dx;ez=event.dz}
    const r=d-event.front
    if(r>0){
      const shape=r/24*Math.exp(1-r/24),slope=Math.exp(1-r/24)*(1-r/24)/24
      const amplitude=2.8*event.bore,value=amplitude*shape
      if(value>lift){lift=value;liftX=amplitude*slope*(ddx-event.dx)+2.8*event.boreX*shape;liftZ=amplitude*slope*(ddz-event.dz)+2.8*event.boreZ*shape}
    }
  }
  return {edge,ex,ez,lift,liftX,liftZ}
}

export function oceanWaveAt(x,z,time,maxFootprint=0,seed=0){
  time+=seed*.001
  let height=0,dx=0,dz=0
  for(const wave of OCEAN_WAVES){
    const a=wave.amplitude*(1-smooth(wave.wavelength*.12,wave.wavelength*.5,maxFootprint))
    if(!a)continue
    const length=Math.hypot(wave.x,wave.z),nx=wave.x/length,nz=wave.z/length
    const k=TAU/wave.wavelength,omega=Math.sqrt(9.81*k),along=nx*x+nz*z
    const kg=TAU/(wave.wavelength*4.5+190)
    const g=kg*(along-omega/(2*k)*time)+wave.phase*.7
    const across=-nz*x+nx*z,cross=.009*across-.065*time+wave.phase*2
    const bend=.013*along+.019*across-.09*time+wave.phase*1.3
    const q=k*along-omega*time+wave.phase+.78*Math.sin(cross)+.44*Math.sin(bend),s=Math.sin(q),c=Math.cos(q)
    const qx=k*nx-.78*Math.cos(cross)*.009*nz+.44*Math.cos(bend)*(.013*nx-.019*nz)
    const qz=k*nz+.78*Math.cos(cross)*.009*nx+.44*Math.cos(bend)*(.013*nz+.019*nx)
    const group=1.15+.25*Math.sin(g)+.15*Math.sin(cross)
    const gx=.25*Math.cos(g)*kg*nx-.15*Math.cos(cross)*.009*nz
    const gz=.25*Math.cos(g)*kg*nz+.15*Math.cos(cross)*.009*nx
    const shape=s+.24*(s*s-.5),slope=c*(1+.48*s)
    height+=a*group*shape
    dx+=a*(gx*shape+group*slope*qx)
    dz+=a*(gz*shape+group*slope*qz)
  }
  return {height,dx,dz}
}

// One horizontal swash edge advances and retreats around the whole island.
// Small, long alongshore offsets vary its reach without making isolated caps.
// Wave height NEVER decides whether a fragment is sand: doing that against the
// old -2.6m flat bed exposed enclosed sand ovals in offshore wave troughs.
export function coastSurfaceAt(x,z,time,d,{dx:ddx=1,dz:ddz=0,footprint=COAST_GEOMETRY_FOOTPRINT,seed=0}={}){
  const swell=oceanWaveAt(x,z,time,footprint,seed)
  // Unbounded time-noise cells continually generate new set strength, spacing
  // and side preference. There is no finite preset bank or repeated swash clip.
  const arrivalNoise=controlNoise(x*.0021+z*.0017,time*.062,seed^505)
  const arrival=.38*(arrivalNoise.value-.5),ax=.38*arrivalNoise.dx*.0021,az=.38*arrivalNoise.dx*.0017
  const phase=coastPhase(time,seed)+arrival
  const eventWater=coastEventWaterAt(x,z,time,d,ddx,ddz,seed)
  const {edge,ex,ez}=eventWater
  const r=d-edge,rx=ddx-ex,rz=ddz-ez
  const offshore=Math.max(d-160,0),beach=-6*smooth(-110,160,d)-.035*offshore*offshore/(50+offshore)
  const beachD=-6*smoothD(-110,160,d)-.035*offshore*(100+offshore)/(50+offshore)**2
  // The front thins to zero depth at r=0, then joins the deeper sea. The
  // incoming crest phase grows with d and t, so its speed is toward the beach.
  const curl1=x*.023+z*.017-time*.19,curl2=x*.053-z*.041+time*.11
  const q=d*(TAU/78)+phase+.44*Math.sin(curl1)+.18*Math.sin(curl2),s=Math.sin(q),shape=s+.18*(s*s-.5),slope=Math.cos(q)*(1+.36*s)
  const qx=TAU/78*ddx+ax+.44*Math.cos(curl1)*.023+.18*Math.cos(curl2)*.053
  const qz=TAU/78*ddz+az+.44*Math.cos(curl1)*.017-.18*Math.cos(curl2)*.041
  const groupPhase=x*.019-z*.023-time*.16,roll=.42+.16*Math.sin(groupPhase)
  const rollX=.16*Math.cos(groupPhase)*.019,rollZ=-.16*Math.cos(groupPhase)*.023
  const ramp=smooth(0,85,r),rampD=smoothD(0,85,r),motion=roll*shape+.18*swell.height
  // A thin elevated lip gives the advancing wash a real rolling front. Its
  // height varies in shore-parallel groups but always thins to the same edge.
  const near=beach+.016*r+ramp*motion+eventWater.lift
  const nx=beachD*ddx+.016*rx+rampD*rx*motion+ramp*(rollX*shape+roll*slope*qx+.18*swell.dx)+eventWater.liftX
  const nz=beachD*ddz+.016*rz+rampD*rz*motion+ramp*(rollZ*shape+roll*slope*qz+.18*swell.dz)+eventWater.liftZ
  const floor=beach+.004*r,sea=-1.22+swell.height,limited=sea<floor
  const deep=limited?floor:sea,deepX=limited?beachD*ddx+.004*rx:swell.dx,deepZ=limited?beachD*ddz+.004*rz:swell.dz
  const blend=smooth(0,160,d),blendD=smoothD(0,160,d)
  const water=near+(deep-near)*blend
  const dx=nx+(deepX-nx)*blend+(deep-near)*blendD*ddx
  const dz=nz+(deepZ-nz)*blend+(deep-near)*blendD*ddz
  const coverage=smooth(-1.4,1.4,r)
  let breaker=0,foam=0
  if(d>-120&&d<155){
    const flow=-edge*.045+time*.012
    const fx=x*.18+foamNoise(x*.037,z*.037)*1.7+ddx*flow,fz=z*.18+foamNoise(x*.029+9,z*.029-3)*1.7+ddz*flow
    const grain=.55*foamNoise(fx,fz)+.3*foamNoise(fx*2.9+7.3,fz*2.9-4.1)+.15*foamNoise(fx*7.1+31,fz*7.1+19)
    const density=smooth(.28,.7,grain)
    breaker=smooth(-28,12,d)*(1-smooth(70,155,d))*.5*smooth(.55,.98,s)*(.2+.8*density)
    const wash=(.9*Math.exp(-((r-20)**2)/120)+.35*Math.exp(-((r-35)**2)/300)*smooth(.48,.72,grain))*(.12+.88*density)
    foam=clamp(coverage*(wash+breaker))
  }
  const wet=smooth(-111,-98,d)*(1-smooth(8,80,r))*(.82+.18*Math.sin(phase-.6))
  return {water,beach,surface:Math.max(water,beach),dx,dz,coverage,foam,wet,breaker,edge}
}

const n=value=>Number(value).toFixed(8)
export const OCEAN_WAVES_GLSL=`
  uniform float uSeaSeed;
  float seaControlHash(ivec2 p,uint salt){
    uint h=uint(p.x)*374761393u^uint(p.y)*668265263u^(uint(uSeaSeed)^salt)*2246822519u;
    h=(h^(h>>13u))*1274126177u;h^=h>>16u;return float(h)/4294967295.;
  }
  vec3 seaControl(vec2 p,uint salt){
    ivec2 i=ivec2(floor(p));vec2 t=fract(p),f=t*t*(3.-2.*t);
    float a=seaControlHash(i,salt),b=seaControlHash(i+ivec2(1,0),salt),c=seaControlHash(i+ivec2(0,1),salt),d=seaControlHash(i+ivec2(1,1),salt);
    float bottom=mix(a,b,f.x),top=mix(c,d,f.x);
    return vec3(mix(bottom,top,f.y),mix(b-a,d-c,f.y)*6.*t.x*(1.-t.x),(top-bottom)*6.*t.y*(1.-t.y));
  }
  float coastPhase(float t){return .62*t+1.4*(seaControl(vec2(11.+t*.045,0.),101u).x-seaControl(vec2(11.,0.),101u).x)+.7*(seaControl(vec2(37.+t*.083,0.),102u).x-seaControl(vec2(37.,0.),102u).x);}
  float coastSmoothD(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return 6.*t*(1.-t)/(b-a);}
  struct CoastEvent{vec3 front;vec3 baseline;float center;float height;float strength;float breaking;float progress;float waveId;float spill;float bore;vec2 boreSlope;float foamStrength;};
  vec3 coastEventControl(vec2 anchor,vec3 jac,vec2 scale,float t,uint salt){
    vec3 field=seaControl(vec2(dot(anchor,scale),t),salt);
    return vec3(field.x,field.y*vec2(scale.x*jac.x+scale.y*jac.y,scale.x*jac.y+scale.y*jac.z));
  }
  CoastEvent coastEvent(vec2 p,float t,float index){
    vec2 offset=p-vec2(${COAST_CENTER.map(n).join(',')});float radius=max(length(offset),1.);vec2 ray=offset/radius;
    vec2 anchor=vec2(${COAST_CENTER.map(n).join(',')})+ray*1000.;vec3 jac=1000./radius*vec3(1.-ray.x*ray.x,-ray.x*ray.y,1.-ray.y*ray.y);
    vec3 jitter=coastEventControl(anchor,jac,vec2(.0027,.0021),t*.037,811u);
    float cycle=coastPhase(t)/(6.28318530718*3.)+index/3.+seaControl(vec2(5.12,9.7),812u).x+(jitter.x-.5)*.035;
    CoastEvent event;event.progress=fract(cycle);event.waveId=floor(cycle);vec2 progressSlope=jitter.yz*.035;
    vec3 bed=coastEventControl(anchor,jac,vec2(.0015,.0011),0.,303u);event.baseline=vec3(-40.+4.*(bed.x-.5),bed.yz*4.);
    vec3 range=coastEventControl(anchor,jac,vec2(.0015,.0011),event.waveId*.73+index*11.,202u);float reach=40.+24.*range.x;
    vec3 bend=coastEventControl(anchor,jac,vec2(.009,.007),event.waveId*.71+index*17.,813u),shorter=coastEventControl(anchor,jac,vec2(.026,-.021),event.waveId*.43+index*23.,817u);
    float bendHeight=(bend.x-.5)*20.+(shorter.x-.5)*12.;vec2 bendSlope=bend.yz*20.+shorter.yz*12.;
    if(event.progress<.64){
      float u=event.progress/.64,s=pow(sin(3.14159265359*u),2.),f=u*u*(1.-u),launch=4.*.64/.36;
      float acceleration=reach*launch-(220.-event.baseline.x);
      float slope=((event.baseline.x-220.)+acceleration*(2.*u-3.*u*u)+bendHeight*3.14159265359*sin(6.28318530718*u))/.64;
      event.front=vec3(220.+(event.baseline.x-220.)*u+acceleration*f+bendHeight*s,event.baseline.yz*u+(range.yz*24.*launch+event.baseline.yz)*f+bendSlope*s+slope*progressSlope);
    }else{
      float u=(event.progress-.64)/.36,travel=4.*u*(1.-u),slope=-4.*reach*(1.-2.*u)/.36;
      event.front=vec3(event.baseline.x-reach*travel,event.baseline.yz-range.yz*24.*travel+slope*progressSlope);
    }
    float birth=smoothstep(0.,.10,event.progress);event.center=event.front.x+10.;event.strength=birth*(1.-smoothstep(.42,.64,event.progress));
    event.bore=smoothstep(.42,.62,event.progress)*(1.-smoothstep(.95,1.,event.progress));
    float boreD=coastSmoothD(.42,.62,event.progress)*(1.-smoothstep(.95,1.,event.progress))-smoothstep(.42,.62,event.progress)*coastSmoothD(.95,1.,event.progress);
    event.boreSlope=boreD*progressSlope;
    event.height=6.4+4.8*coastEventControl(anchor,jac,vec2(.007,-.005),event.waveId*.73+index*11.,814u).x;
    float broad=coastEventControl(anchor,jac,vec2(.009,.005),t*.045+index*17.,815u).x,detail=coastEventControl(anchor,jac,vec2(.029,-.023),t*.073+index*23.,816u).x;
    event.spill=clamp(1.8*(broad-.25)+.6*(detail-.5),0.,1.);event.breaking=clamp((1.-smoothstep(65.,195.,event.center))*(.4+.7*event.spill),0.,1.);
    event.foamStrength=birth*(1.-smoothstep(.96,1.,event.progress));return event;
  }
  struct CoastEventWater{vec3 edge;vec3 lift;};
  CoastEventWater coastEventWater(vec2 p,float d,float t,vec2 dd){
    CoastEventWater result;result.edge=vec3(0.);result.lift=vec3(0.);
    for(int i=0;i<3;i++){
      CoastEvent event=coastEvent(p,t,float(i));if(i==0)result.edge=event.baseline;
      if(event.front.x<result.edge.x)result.edge=event.front;
      float r=d-event.front.x;
      if(r>0.){
        float shape=r/24.*exp(1.-r/24.),slope=exp(1.-r/24.)*(1.-r/24.)/24.,amplitude=2.8*event.bore,value=amplitude*shape;
        if(value>result.lift.x)result.lift=vec3(value,amplitude*slope*(dd-event.front.yz)+2.8*event.boreSlope*shape);
      }
    }
    return result;
  }
  vec3 oceanBand(vec2 p,float t,float wavelength,float amplitude,vec2 direction,float phase,float footprint){
    float k=6.28318530718/wavelength,omega=sqrt(9.81*k);vec2 dir=normalize(direction);
    float along=dot(p,dir);
    float a=amplitude*(1.0-smoothstep(wavelength*.12,wavelength*.5,footprint));
    float kg=6.28318530718/(wavelength*4.5+190.);
    float g=kg*(along-omega/(2.*k)*t)+phase*.7;
    vec2 across=vec2(-dir.y,dir.x);
    float crossPhase=dot(p,across)*.009-.065*t+phase*2.;
    float bend=.013*along+.019*dot(p,across)-.09*t+phase*1.3;
    float q=along*k-omega*t+phase+.78*sin(crossPhase)+.44*sin(bend),s=sin(q),c=cos(q);
    vec2 phaseSlope=k*dir+.78*cos(crossPhase)*.009*across+.44*cos(bend)*(.013*dir+.019*across);
    float group=1.15+.25*sin(g)+.15*sin(crossPhase);
    vec2 groupSlope=.25*cos(g)*kg*dir+.15*cos(crossPhase)*.009*across;
    float shape=s+.24*(s*s-.5),slope=c*(1.+.48*s);
    return vec3(group*shape,groupSlope*shape+group*slope*phaseSlope)*a;
  }
  vec3 sea(vec2 p,float t,float footprint){float st=t+uSeaSeed*.001;return ${OCEAN_WAVES.map(w=>`oceanBand(p,st,${n(w.wavelength)},${n(w.amplitude)},vec2(${n(w.x)},${n(w.z)}),${n(w.phase)},footprint)`).join('+')};}
  float beachHeight(vec2 p,float d){float offshore=max(d-160.,0.);return -6.*smoothstep(-110.,160.,d)-.035*offshore*offshore/(50.+offshore);}
  vec3 coastArrival(vec2 p,float t){
    vec3 field=seaControl(vec2(dot(p,vec2(.0021,.0017)),t*.062),505u);
    return vec3(.38*(field.x-.5),.38*field.y*vec2(.0021,.0017));
  }
  vec3 coastEdge(vec2 p,float t){
    return coastEventWater(p,0.,t,vec2(0.)).edge;
  }
  vec3 coastRoll(vec2 p,float d,float t,vec2 dd){
    vec3 arrival=coastArrival(p,t);float a=dot(p,vec2(.023,.017))-.19*t,b=dot(p,vec2(.053,-.041))+.11*t;
    return vec3(d*(6.28318530718/78.)+coastPhase(t)+arrival.x+.44*sin(a)+.18*sin(b),
      dd*(6.28318530718/78.)+arrival.yz+.44*cos(a)*vec2(.023,.017)+.18*cos(b)*vec2(.053,-.041));
  }
  vec3 coastWaterFromSwell(vec2 p,float d,float t,vec2 dd,vec3 swell){
    if(d>=160.)return vec3(-1.22+swell.x,swell.yz);
    CoastEventWater event=coastEventWater(p,d,t,dd);vec3 edge=event.edge;float r=d-edge.x;vec2 dr=dd-edge.yz;
    float offshore=max(d-160.,0.),beach=beachHeight(p,d);
    float beachD=-6.*coastSmoothD(-110.,160.,d)-.035*offshore*(100.+offshore)/pow(50.+offshore,2.);
    vec3 rollPhase=coastRoll(p,d,t,dd);float s=sin(rollPhase.x),shape=s+.18*(s*s-.5),slope=cos(rollPhase.x)*(1.+.36*s);
    float groupPhase=dot(p,vec2(.019,-.023))-.16*t,roll=.42+.16*sin(groupPhase);
    vec2 rollSlope=.16*cos(groupPhase)*vec2(.019,-.023);
    float ramp=smoothstep(0.,85.,r),rampD=coastSmoothD(0.,85.,r),motion=roll*shape+.18*swell.x;
    vec3 nearWater=vec3(beach+.016*r+ramp*motion+event.lift.x,beachD*dd+.016*dr+rampD*dr*motion+ramp*(rollSlope*shape+roll*slope*rollPhase.yz+.18*swell.yz)+event.lift.yz);
    vec3 deepWater=vec3(-1.22+swell.x,swell.yz),floorWater=vec3(beach+.004*r,beachD*dd+.004*dr);
    if(deepWater.x<floorWater.x)deepWater=floorWater;
    float blend=smoothstep(0.,160.,d),blendD=coastSmoothD(0.,160.,d);
    return vec3(mix(nearWater.x,deepWater.x,blend),mix(nearWater.yz,deepWater.yz,blend)+(deepWater.x-nearWater.x)*blendD*dd);
  }
  vec3 coastWater(vec2 p,float d,float t,float footprint,vec2 dd){return coastWaterFromSwell(p,d,t,dd,sea(p,t,footprint));}
  float waterHeight(vec2 p,float d,float t){return coastWater(p,d,t,${n(COAST_GEOMETRY_FOOTPRINT)},vec2(0.)).x;}
  struct CoastSample{vec3 water;float beach;float coverage;float foam;float wet;};
  float coastFoamHash(vec2 p){p=mod(p,2048.);return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float coastFoamNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(coastFoamHash(i),coastFoamHash(i+vec2(1.,0.)),f.x),mix(coastFoamHash(i+vec2(0.,1.)),coastFoamHash(i+vec2(1.,1.)),f.x),f.y);}
  CoastSample coastAt(vec2 p,float d,float t,float footprint,vec2 dd){
    CoastSample result;vec3 swell=sea(p,t,footprint);
    result.water=coastWaterFromSwell(p,d,t,dd,swell);result.beach=beachHeight(p,d);
    if(d>=160.){result.coverage=1.;result.foam=0.;result.wet=0.;return result;}
    vec3 arrival=coastArrival(p,t),edge=coastEdge(p,t);float r=d-edge.x,phase=coastPhase(t)+arrival.x;
    result.coverage=smoothstep(-1.4,1.4,r);
    result.foam=0.;
    if(d>-120.&&d<155.){
      float s=sin(coastRoll(p,d,t,dd).x),flow=-edge.x*.045+t*.012;
      vec2 q=p*.18+vec2(coastFoamNoise(p*.037),coastFoamNoise(p*.029+vec2(9.,-3.)))*1.7+dd*flow;
      float grain=.55*coastFoamNoise(q)+.3*coastFoamNoise(q*2.9+vec2(7.3,-4.1))+.15*coastFoamNoise(q*7.1+vec2(31.,19.));
      float density=smoothstep(.28,.7,grain);
      float breaker=smoothstep(-28.,12.,d)*(1.-smoothstep(70.,155.,d))*.5*smoothstep(.55,.98,s)*(.2+.8*density);
      float front=r-20.,trail=r-35.;
      float wash=(.9*exp(-front*front/120.)+.35*exp(-trail*trail/300.)*smoothstep(.48,.72,grain))*(.12+.88*density);
      result.foam=clamp(result.coverage*(wash+breaker),0.,1.);
    }
    result.wet=smoothstep(-111.,-98.,d)*(1.-smoothstep(8.,80.,r))*(.82+.18*sin(phase-.6));
    return result;
  }
`
