import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { buildAirportArchitecture } from './airportArchitecture.js'
import { airportPhysicalMaterial } from './airportMaterials.js'
import { AIRPORT_APRON_LIGHT_XS } from './airportPlan.js'

const noRaycast=()=>null
const finishes={
  wall:{color:'#c0b7a4',roughness:.87},concrete:{color:'#8c908b',roughness:.93},
  hangarWall:{color:'#73868b',metalness:.38,roughness:.67},
  hangarRoof:{color:'#9aa5a8',metalness:.65,roughness:.55},
  roof:{color:'#707a7c',metalness:.45,roughness:.61},
  metal:{color:'#697a81',metalness:.78,roughness:.4},
  structure:{color:'#52616b',metalness:.7,roughness:.57},
  equipment:{color:'#8b9292',metalness:.32,roughness:.69},
  glass:{color:'#88abb9',metalness:.18,roughness:.13,transparent:true,opacity:.38,depthWrite:false,clearcoat:1},
  interior:{color:'#a2a198',roughness:.82},ceiling:{color:'#b8b3a4',roughness:.8},
  seat:{color:'#273e49',metalness:.12,roughness:.63},
  bollard:{color:'#b99a3c',roughness:.58},
  warmLens:{color:'#fff2d3',emissive:'#ffe2a6',emissiveIntensity:2,roughness:.4},
  redLens:{color:'#9d2117',emissive:'#ff301c',emissiveIntensity:2,roughness:.4},
}

function signTexture(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128
  const c=canvas.getContext('2d');c.fillStyle='#15222a';c.fillRect(0,0,1024,128)
  c.fillStyle='#d9dfd9';c.font='600 61px Manrope, sans-serif';c.textAlign='center';c.fillText('ISLAND AIRFIELD',512,83)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8
  return texture
}

function airfieldLights(){
  const positions=[],colors=[]
  const point=(x,y,z,color)=>{positions.push(x,y,z);colors.push(...new THREE.Color(color).toArray())}
  for(let x=-1052;x<=-388;x+=32)for(const side of [-1,1])point(x,.48,710+side*14.4,'#fff1d4')
  for(const x of [-1058,-382])for(let z=700;z<=720;z+=4)point(x,.48,z,'#90cda0')
  for(let x=-1018;x<=-422;x+=42)for(const side of [-1,1])point(x,.43,674+side*6,'#608fc5')
  for(const x of AIRPORT_APRON_LIGHT_XS)point(x,11.8,620,'#ffe2aa')
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3))
  const material=new THREE.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,fog:false,
    vertexShader:`varying vec3 vColor;void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(550./max(-p.z,1.),1.5,5.);}`,
    fragmentShader:`varying vec3 vColor;void main(){float r=length(gl_PointCoord-.5)*2.;float a=1.-smoothstep(.08,1.,r);if(a<.015)discard;gl_FragColor=vec4(vColor*1.4,a);#include <colorspace_fragment>}`.replace(';#include',';\n#include')})
  const lights=new THREE.Points(geometry,material);lights.frustumCulled=false;lights.raycast=noRaycast
  return lights
}

export default function AirportBuildings(){
  const sources=useLoader(THREE.TextureLoader,['/assets/environment/facade-diffuse.jpg','/assets/environment/facade-normal.jpg'])
  const owned=useMemo(()=>{
    const maps=sources.map((source,i)=>{const t=source.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;return t})
    const parts=buildAirportArchitecture().map(({role,geometry})=>{
      const opts={...finishes[role],fog:false}
      if(['wall','concrete','hangarWall','hangarRoof'].includes(role)){
        opts.map=maps[0];opts.normalMap=maps[1];opts.normalScale=new THREE.Vector2(.3,.3)
      }
      const source=new THREE.MeshPhysicalMaterial(opts)
      const material=airportPhysicalMaterial(source);source.dispose()
      const mesh=new THREE.Mesh(geometry,material);mesh.name=`airfield-${role}`;mesh.raycast=noRaycast
      return mesh
    })
    const texture=signTexture(),signMaterial=new THREE.MeshBasicMaterial({map:texture,color:'#b6bcba',toneMapped:false})
    // Both arrival elevations carry a readable, subdued illuminated fascia.
    for(const [z,yaw] of [[591.2,Math.PI],[612.8,0]]){
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(13,1.625),signMaterial)
      sign.position.set(-730,4.27,z);sign.rotation.y=yaw;sign.raycast=noRaycast;parts.push(sign)
    }
    const lights=airfieldLights();parts.push(lights)
    return {parts,maps,texture,signMaterial}
  },[sources])
  useEffect(()=>()=>{
    owned.parts.forEach(p=>{p.geometry.dispose();if(p.material!==owned.signMaterial)p.material.dispose()})
    owned.signMaterial.dispose();owned.texture.dispose();owned.maps.forEach(t=>t.dispose())
  },[owned])
  return <group name="detailed-airfield-buildings">{owned.parts.map(p=><primitive key={p.uuid} object={p}/>)}</group>
}
