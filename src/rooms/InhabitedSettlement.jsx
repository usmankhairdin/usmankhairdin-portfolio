import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { CITY_Y } from './cityPlan.js'
import { buildInhabitedSiteGeometry } from './inhabitedSettlementGeometry.js'

const none=()=>null
function neighborhoodMaterial(){
  return new THREE.ShaderMaterial({vertexColors:true,fog:false,
    vertexShader:`
      attribute float settlementRole;
      attribute vec3 settlementDetail;
      varying vec3 vColor;varying vec3 vNormal;varying vec3 vDetail;varying vec3 vView;varying float vRole;
      void main(){vColor=color;vNormal=normalize(normalMatrix*normal);vDetail=settlementDetail;vRole=settlementRole;
        vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader:`
      varying vec3 vColor;varying vec3 vNormal;varying vec3 vDetail;varying vec3 vView;varying float vRole;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),u.x),u.y);}
      float seam(float coordinate,float period,float thickness){float d=abs(fract(coordinate/period+.5)-.5)*period;float aa=max(fwidth(coordinate),.002);return 1.-smoothstep(thickness-aa,thickness+aa,d);}
      void main(){
        vec3 normal=normalize(vNormal),worldNormal=normalize(vec3(vec4(normal,0.)*viewMatrix)),base=vColor;
        float moon=max(dot(worldNormal,normalize(vec3(-.35,.78,.42))),0.);
        float grain=mix(.94,1.05,n2(vDetail.xz*1.8+vDetail.y*.37));
        if(vRole<.5){
          float mortar=seam(vDetail.y,.28,.009)*.15;
          vec2 wallUv=abs(worldNormal.x)>.65?vDetail.zy:vDetail.xy;
          mortar=max(mortar,seam(wallUv.x+floor(wallUv.y/.28)*.23,.55,.008)*.05);
          base*=grain-mortar;
        }
        if(vRole>.5&&vRole<1.5){
          float courses=seam(vDetail.z,.35,.014),tiles=seam(vDetail.x+floor(vDetail.z/.35)*.12,.24,.008);
          base*=grain*(1.-.20*courses-.1*tiles);
        }
        vec3 light=vec3(.07,.09,.12)+vec3(.11,.14,.19)*moon;
        light+=vec3(.07,.054,.035)*exp(-max(vDetail.y,0.)/12.);
        vec3 result=base*light;
        if(vRole>2.5&&vRole<3.5)result=base*(.12+.12*moon);
        if(vRole>3.5&&vRole<4.5)result=base*.75;
        if(vRole>7.5&&vRole<8.5)result=base*.48;
        float haze=min((1.-exp(-length(vView)*.00016))*.5,.5);
        gl_FragColor=vec4(mix(result,vec3(.012,.019,.029),haze),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})
}

export default function InhabitedSettlement({sites=[],groundY=CITY_Y}){
  const owned=useMemo(()=>{
    const tiles=new Map(),material=neighborhoodMaterial()
    for(const site of sites){
      const key=`${Math.floor(site.x/160)},${Math.floor(site.z/160)}`
      if(!tiles.has(key))tiles.set(key,[])
      tiles.get(key).push(buildInhabitedSiteGeometry(site))
    }
    const meshes=[]
    for(const [key,parts]of tiles){
      const geometry=mergeGeometries(parts,false);parts.forEach(part=>part.dispose())
      geometry.computeBoundingBox();geometry.computeBoundingSphere()
      const mesh=new THREE.Mesh(geometry,material);mesh.name=`inhabited-neighborhood-${key}`;mesh.raycast=none;meshes.push(mesh)
    }
    return {meshes,material}
  },[sites])
  useEffect(()=>()=>{owned.meshes.forEach(mesh=>mesh.geometry.dispose());owned.material.dispose()},[owned])
  return <group name="inhabited-island-neighborhoods" position={[0,groundY,0]} dispose={null}>
    {owned.meshes.map(mesh=><primitive key={mesh.uuid} object={mesh}/>)}
  </group>
}
