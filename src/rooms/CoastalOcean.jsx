import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { CITY_Y } from './cityPlan.js'
import { EXTERIOR_COAST_GLSL } from './exteriorPlan.js'
import { COAST_SAND_GLSL, COAST_GEOMETRY_FOOTPRINT, OCEAN_WAVES_GLSL, createOceanSeed } from './coastSurface.js'
import { createCoastGeometry } from './coastGeometry.js'
import { BREAKER_SURFACE_GLSL } from './breakerSurface.js'
import { OCEAN_SHADING_GLSL } from './oceanShading.js'
import OceanBreakers from './OceanBreakers.jsx'
const noRay=()=>null
const NOISE=`float hash(vec2 p){p=mod(p,2048.0);return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}`
const WAVES=OCEAN_WAVES_GLSL

export default function CoastalOcean() {
  const surface=useRef()
  const root=useRef()
  const time=useMemo(()=>({value:0}),[])
  const seed=useMemo(()=>({value:createOceanSeed()}),[])
  const sources=useLoader(THREE.TextureLoader,['/assets/environment/beach-diffuse.jpg','/assets/environment/beach-normal.jpg'])
  const maps=useMemo(()=>sources.map((source,i)=>{
    const map=source.clone();map.wrapS=map.wrapT=THREE.RepeatWrapping
    map.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;map.anisotropy=8
    map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter
    return map
  }),[sources])
  const geometry=useMemo(createCoastGeometry,[])
  const eye=useMemo(()=>new THREE.Vector3(),[])
  const origin=useMemo(()=>new THREE.Vector3(),[])
  const material=useMemo(()=>new THREE.ShaderMaterial({fog:false,
    uniforms:{uTime:time,uSeaSeed:seed,uSand:{value:maps[0]},uSandNormal:{value:maps[1]},uEye:{value:eye},uOrigin:{value:origin}},
    vertexShader:` ${EXTERIOR_COAST_GLSL} ${WAVES} uniform float uTime;uniform vec3 uOrigin;varying vec3 vLocal;
      void main(){vec4 w=modelMatrix*vec4(position,1.0);vec3 c=w.xyz-uOrigin;float d=islandDistance(c.xz);
      w.y+=max(beachHeight(c.xz,d),waterHeight(c.xz,d,uTime));
      vLocal=vec3(c.x,w.y-uOrigin.y,c.z);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`${EXTERIOR_COAST_GLSL} ${NOISE} ${WAVES} ${BREAKER_SURFACE_GLSL} ${OCEAN_SHADING_GLSL} ${COAST_SAND_GLSL} uniform float uTime;uniform vec3 uEye;uniform sampler2D uSand,uSandNormal;varying vec3 vLocal;
      void main(){vec2 p=vLocal.xz;float d=islandDistance(p);if(d<=-180.0)discard;
      float t=uTime;
      float footprint=max(length(dFdx(p)),length(dFdy(p)));
      vec2 dd=vec2(islandDistance(p+vec2(.5,0.))-islandDistance(p-vec2(.5,0.)),
                   islandDistance(p+vec2(0.,.5))-islandDistance(p-vec2(0.,.5)));
      // Broad normals are derivatives of the same displaced field as vertices,
      // including the connected runup sheet and its join to the deep sea.
      CoastSample coast=coastAt(p,d,t,max(${COAST_GEOMETRY_FOOTPRINT.toFixed(1)},footprint),dd);
      float coverage=coast.coverage;
      // City air stays exact on the sand; open water gradually takes on the
      // cooler, clearer marine atmosphere beyond the shallow coastal band.
      float marine=coverage*smoothstep(30.0,220.0,d);
      vec3 sand=coastSandColor(uSand,p);
      vec3 sandNormal=texture2D(uSandNormal,p/30.0).xyz*2.0-1.0;
      float beachDetail=smoothstep(-180.0,-145.0,d);
      sand*=mix(1.0,.9+.1*dot(sandNormal,normalize(vec3(.4,.3,1.0))),beachDetail);
      sand*=mix(1.0,.48,coast.wet);
      float grass=smoothstep(-179.0,-155.0,d)*(1.0-smoothstep(-145.0,-95.0,d))*smoothstep(.36,.72,noise(p*.026));
      sand=mix(sand,vec3(.038,.039,.028),grass*.25);
      // Fine wind ripples use travelling analytic waves too. No repeated normal
      // tile slides over the surface, and subpixel frequencies fade smoothly.
      vec3 ripples=oceanBand(p,t,7.1,.018,vec2(-1.,.18),.4,footprint)
        +oceanBand(p,t,4.3,.008,vec2(-.86,-.3),2.1,footprint)
        +oceanBand(p,t,2.6,.003,vec2(-.9,.42),4.8,footprint);
      vec2 shortSlope=ripples.yz*smoothstep(-25.,90.,d);
      vec3 n=normalize(vec3(-coast.water.y-shortSlope.x,1.0,-coast.water.z-shortSlope.y)),v=normalize(uEye-vLocal);
      // Broad whitewater remains after a breaking front passes. Its turbulent
      // texture is advected and shaded on the water, independent of coverage.
      float foam=max(coast.foam*.5,breakerFoam(p,d,t,coverage));
      float froth=surfFroth(p,t,footprint);
      float depth=max(coast.water.x-coast.beach,.01);
      vec3 water=oceanShade(vLocal,n,uEye,d,depth,foam,froth,foam*.25,max(coast.water.x+1.22,0.),footprint);
      vec3 color=mix(sand,water,coverage);
      color=oceanHaze(color,vLocal,uEye,marine);
      gl_FragColor=vec4(color,1.0);
      #include <colorspace_fragment>
      }`,
  }),[time,seed,maps,eye,origin])
  useFrame(({camera},dt)=>{
    if (!root.current?.parent?.visible) return
    time.value += Math.min(dt,.05)
    root.current.getWorldPosition(origin)
    camera.getWorldPosition(eye).sub(origin)
  })
  useEffect(()=>()=>{material.dispose();geometry.dispose();maps.forEach(map=>map.dispose())},[material,geometry,maps])
  return <group ref={root}>
    <mesh ref={surface} geometry={geometry} material={material} position={[0,CITY_Y,0]} frustumCulled={false} raycast={noRay}/>
    <OceanBreakers time={time} seed={seed} eye={eye} origin={origin}/>
  </group>
}
