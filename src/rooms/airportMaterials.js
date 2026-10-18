import * as THREE from 'three'
import { EXTERIOR_OFFSET } from './gallerySite.js'
import { AIRPORT_OFFSET,AIRPORT_YAW,AIRPORT_APRON_LIGHT_XS } from './airportPlan.js'
import { CITY_Y } from './cityPlan.js'
import { nightSkyUniforms } from '../experience/nightSkyUniforms.js'

const sourceFromWorld=new THREE.Matrix4().compose(
  new THREE.Vector3(EXTERIOR_OFFSET[0]+AIRPORT_OFFSET[0],CITY_Y,EXTERIOR_OFFSET[2]+AIRPORT_OFFSET[2]),
  new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),AIRPORT_YAW),new THREE.Vector3(1,1,1)).invert()
const physicalSetup=THREE.ShaderChunk.lights_fragment_begin.split('IncidentLight directLight;')[0]
const lighting=`
  ${physicalSetup}
  IncidentLight airportLight;airportLight.visible=true;
  airportLight.direction=normalize(mat3(viewMatrix)*normalize(uMoonDirection));
  airportLight.color=vec3(.22,.29,.38);
  RE_Direct_Physical(airportLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
  vec3 localAirport=(airportSourceFromWorld*vec4(vAirportPosition,1.)).xyz;
  for(int i=0;i<3;i++){
    vec3 toLamp=airportApronLights[i]-localAirport;
    float d=dot(toLamp,toLamp);
    airportLight.direction=normalize(mat3(viewMatrix)*mat3(airportSourceToWorld)*toLamp);
    airportLight.color=vec3(1.,.80,.57)*(235./(d+20.));
    RE_Direct_Physical(airportLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
  }
  vec3 airportNormal=inverseTransformDirection(geometryNormal,viewMatrix);
  vec3 irradiance=mix(vec3(.035,.042,.05),vec3(.13,.18,.24),clamp(airportNormal.y*.5+.5,0.,1.));
  RE_IndirectDiffuse_Physical(irradiance,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
  vec3 reflection=inverseTransformDirection(reflect(-geometryViewDir,geometryNormal),viewMatrix);
  vec3 radiance=mix(vec3(.02,.025,.03),vec3(.06,.10,.16),smoothstep(-.1,.65,reflection.y));
  RE_IndirectSpecular_Physical(radiance,irradiance,radiance,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
`
export function airportPhysicalMaterial(source){
  const material=source.clone();material.fog=false;material.envMap=null
  material.onBeforeCompile=shader=>{
    shader.uniforms.airportSourceFromWorld={value:sourceFromWorld}
    shader.uniforms.airportSourceToWorld={value:sourceFromWorld.clone().invert()}
    shader.uniforms.uMoonDirection=nightSkyUniforms.uMoonDirection
    shader.uniforms.airportApronLights={value:AIRPORT_APRON_LIGHT_XS.map(x=>new THREE.Vector3(x,12,620))}
    shader.vertexShader=`varying vec3 vAirportPosition;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>\nvAirportPosition=(modelMatrix*vec4(transformed,1.)).xyz;`)
    shader.fragmentShader=`varying vec3 vAirportPosition;uniform mat4 airportSourceFromWorld;uniform mat4 airportSourceToWorld;uniform vec3 uMoonDirection;uniform vec3 airportApronLights[3];\n${shader.fragmentShader}`
      .replace('#include <lights_fragment_begin>',lighting).replace('#include <lights_fragment_maps>','').replace('#include <lights_fragment_end>','')
      .replace('#include <opaque_fragment>',`outgoingLight=mix(outgoingLight,vec3(.007,.011,.017),min(1.-exp(-length(vViewPosition)*.0005),.66));\n#include <opaque_fragment>`)
  }
  material.customProgramCacheKey=()=> 'island-airport-private-night-2'
  return material
}
