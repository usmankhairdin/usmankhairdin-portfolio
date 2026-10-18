import { useEffect,useMemo } from 'react'
import * as THREE from 'three'
import { CITY_Y } from './cityPlan.js'
import { EXTERIOR_COAST_GLSL } from './exteriorPlan.js'
import { OCEAN_WAVES_GLSL,COAST_GEOMETRY_FOOTPRINT } from './coastSurface.js'
import { BREAKER_SURFACE_GLSL } from './breakerSurface.js'
import { OCEAN_SHADING_GLSL } from './oceanShading.js'
import { createBreakerGeometry } from './coastGeometry.js'

const none=()=>null

export default function OceanBreakers({time,seed,eye,origin}){
  const owned=useMemo(()=>{
    const geometry=createBreakerGeometry()
    const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,fog:false,
      uniforms:{uTime:time,uSeaSeed:seed,uEye:{value:eye},uOrigin:{value:origin}},
      vertexShader:`${EXTERIOR_COAST_GLSL} ${OCEAN_WAVES_GLSL} ${BREAKER_SURFACE_GLSL}
        uniform float uTime;uniform vec3 uOrigin;
        attribute vec2 aCoastNormal;attribute float aAcross,aBreaker;
        varying vec3 vLocal,vNormal;varying vec4 vBreaker;varying float vSpill;
        struct SurfVertex{vec3 point;vec3 across;float raised;BreakerWave wave;};
        SurfVertex surfVertex(vec2 rest,float u){
          SurfVertex result;result.wave=breakerWave(rest,uTime,aBreaker);
          BreakerWave wave=result.wave;vec4 profile=breakerProfile(u,wave.breaking);
          vec2 p=breakerPosition(rest,wave.center+profile.x);
          float d=islandDistance(p);
          vec2 dd=vec2(islandDistance(p+vec2(.5,0.))-islandDistance(p-vec2(.5,0.)),islandDistance(p+vec2(0.,.5))-islandDistance(p-vec2(0.,.5)));
          vec3 base=coastWater(p,d,uTime,${COAST_GEOMETRY_FOOTPRINT.toFixed(1)},dd);
          float h=wave.height*wave.strength;
          vec2 lift=breakerLift(profile,h,wave.strength);
          vec3 turbulence=seaControl(p*.045+vec2(uTime*.045,-uTime*.027),831u);
          float churn=(turbulence.x-.5)*.9*profile.y*wave.breaking*wave.strength;
          vec2 churnSlope=turbulence.yz*.045*.9*profile.y*wave.breaking*wave.strength;
          float height=base.x+lift.x+churn;
          vec2 ray=normalize(rest-breakerCenter),du=ray*(profile.z/max(dot(dd,ray),.25));
          result.point=vec3(p.x,height,p.y);result.raised=max(lift.x+churn,0.);
          result.across=vec3(du.x,dot(base.yz+churnSlope,du)+lift.y+(turbulence.x-.5)*.9*profile.w*wave.breaking*wave.strength,du.y);
          return result;
        }
        void main(){
          vec2 rest=position.xz,shoreNormal=normalize(aCoastNormal),tangent=vec2(-shoreNormal.y,shoreNormal.x);
          SurfVertex current=surfVertex(rest,aAcross),left=surfVertex(rest-tangent*.75,aAcross),right=surfVertex(rest+tangent*.75,aAcross);
          vNormal=normalize(cross(right.point-left.point,current.across));
          vec4 w=modelMatrix*vec4(current.point,1.);
          vLocal=w.xyz-uOrigin;
          vBreaker=vec4(aAcross,current.wave.breaking,current.wave.strength,current.raised);
          vSpill=current.wave.spill;
          gl_Position=projectionMatrix*viewMatrix*w;
        }`,
      fragmentShader:`${EXTERIOR_COAST_GLSL} ${OCEAN_WAVES_GLSL} ${BREAKER_SURFACE_GLSL} ${OCEAN_SHADING_GLSL}
        uniform float uTime;uniform vec3 uEye;
        varying vec3 vLocal,vNormal;varying vec4 vBreaker;varying float vSpill;
        void main(){
          float d=islandDistance(vLocal.xz),edge=coastEdge(vLocal.xz,uTime).x;
          if(d<edge+.4)discard;
          float footprint=max(length(dFdx(vLocal.xz)),length(dFdy(vLocal.xz)));
          vec3 n=normalize(vNormal),v=normalize(uEye-vLocal);if(dot(n,v)<0.)n=-n;
          vec3 micro=oceanBand(vLocal.xz,uTime,5.1,.025,vec2(-.8,.4),1.2,footprint)+oceanBand(vLocal.xz,uTime,2.7,.01,vec2(-.3,-1.),4.3,footprint);
          n=normalize(n+vec3(-micro.y,0.,-micro.z)*(.5+.5*(1.-vBreaker.y)));
          float froth=surfFroth(vLocal.xz,uTime,footprint);
          float lip=breakerLip(vBreaker.x,vBreaker.y,vBreaker.z);
          float body=smoothstep(.12,.22,vBreaker.x)*(1.-smoothstep(.75,.86,vBreaker.x));
          float foam=max(breakerFoam(vLocal.xz,d,uTime,1.)*(1.-body*.98),lip*vSpill*(.15+froth));
          float depth=max(vLocal.y-(${CITY_Y.toFixed(2)})-beachHeight(vLocal.xz,d),.05);
          vec3 color=oceanShade(vLocal,n,uEye,d,depth,foam,froth,lip,vBreaker.w,footprint);
          // The sheet must share the exact base response where it emerges.
          // A different foam/normal response exposes its triangle boundary.
          vec2 dd=vec2(islandDistance(vLocal.xz+vec2(.5,0.))-islandDistance(vLocal.xz-vec2(.5,0.)),islandDistance(vLocal.xz+vec2(0.,.5))-islandDistance(vLocal.xz-vec2(0.,.5)));
          CoastSample coast=coastAt(vLocal.xz,d,uTime,max(${COAST_GEOMETRY_FOOTPRINT.toFixed(1)},footprint),dd);
          vec3 ripple=oceanBand(vLocal.xz,uTime,7.1,.018,vec2(-1.,.18),.4,footprint)+oceanBand(vLocal.xz,uTime,4.3,.008,vec2(-.86,-.3),2.1,footprint)+oceanBand(vLocal.xz,uTime,2.6,.003,vec2(-.9,.42),4.8,footprint);
          vec2 shortSlope=ripple.yz*smoothstep(-25.,90.,d);
          vec3 baseNormal=normalize(vec3(-coast.water.y-shortSlope.x,1.,-coast.water.z-shortSlope.y));
          float baseFoam=max(coast.foam*.5,breakerFoam(vLocal.xz,d,uTime,coast.coverage));
          vec3 baseColor=oceanShade(vLocal,baseNormal,uEye,d,max(coast.water.x-coast.beach,.01),baseFoam,froth,baseFoam*.25,max(coast.water.x+1.22,0.),footprint);
          color=mix(baseColor,color,smoothstep(.12,1.4,vBreaker.w));
          color=oceanHaze(color,vLocal,uEye,smoothstep(30.,220.,d));
          gl_FragColor=vec4(color,1.);
          #include <colorspace_fragment>
        }`,
    })
    const mesh=new THREE.InstancedMesh(geometry,material,3)
    for(let i=0;i<3;i++)mesh.setMatrixAt(i,new THREE.Matrix4())
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.raycast=none
    mesh.position.y=CITY_Y;mesh.name='continuous-overturning-surf'
    return {geometry,material,mesh}
  },[time,seed,eye,origin])
  useEffect(()=>()=>{owned.mesh.dispose();owned.geometry.dispose();owned.material.dispose()},[owned])
  return <primitive object={owned.mesh}/>
}
