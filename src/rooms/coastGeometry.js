import * as THREE from 'three'
import { GLASS_Z } from './cityPlan.js'
import { islandDistance } from './exteriorPlan.js'

// The reference experiment prioritizes surf geometry: two metre shore-normal
// spacing, with extra density alongshore. Offshore allocation still expands.
export function createCoastGeometry() {
  const levels=[-210,-190]
  for(let d=-180;d<=260;d+=2)levels.push(d)
  for(let d=270;d<=500;d+=10)levels.push(d)
  levels.push(560,630,720,840,1000,1250,1600,2100,2800,3900,5500,7500,9000)
  const segments=1024,centerX=90,centerZ=GLASS_Z-24
  const positions = new Float32Array(segments*levels.length*3)
  const indices = []
  for(let i=0;i<segments;i++){
    const angle=i*Math.PI*2/segments,nx=Math.cos(angle),nz=Math.sin(angle)
    for(let j=0;j<levels.length;j++){
      let low=0,high=20000
      for(let step=0;step<23;step++){
        const r=(low+high)/2
        if(islandDistance(centerX+nx*r,centerZ+nz*r)<levels[j])low=r
        else high=r
      }
      const r=(low+high)/2,at=j*segments+i
      positions[at*3]=centerX+nx*r;positions[at*3+2]=centerZ+nz*r
      if(j<levels.length-1){
        const next=j*segments+(i+1)%segments,outer=at+segments
        indices.push(at,next,outer,next,next+segments,outer)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  return geometry
}

// A closed contour swept by a dense cross-section. The rest ring stays fixed;
// the vertex shader bends the surface horizontally as well as vertically.
export function createBreakerGeometry(segments=1024,steps=80){
  const count=segments*(steps+1),positions=new Float32Array(count*3),normals=new Float32Array(count*2),across=new Float32Array(count),indices=[]
  const centerX=90,centerZ=GLASS_Z-24
  for(let i=0;i<segments;i++){
    const angle=i*Math.PI*2/segments,rx=Math.cos(angle),rz=Math.sin(angle)
    let low=0,high=4000
    for(let j=0;j<25;j++){
      const radius=(low+high)/2
      if(islandDistance(centerX+rx*radius,centerZ+rz*radius)<0)low=radius
      else high=radius
    }
    const radius=(low+high)/2,x=centerX+rx*radius,z=centerZ+rz*radius
    const dx=islandDistance(x+.5,z)-islandDistance(x-.5,z),dz=islandDistance(x,z+.5)-islandDistance(x,z-.5),length=Math.hypot(dx,dz)
    for(let j=0;j<=steps;j++){
      const at=j*segments+i
      positions.set([x,0,z],at*3);normals.set([dx/length,dz/length],at*2);across[at]=j/steps
      if(j<steps){const next=j*segments+(i+1)%segments,outer=at+segments;indices.push(at,next,outer,next,next+segments,outer)}
    }
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
  geometry.setAttribute('aCoastNormal',new THREE.BufferAttribute(normals,2))
  geometry.setAttribute('aAcross',new THREE.BufferAttribute(across,1))
  geometry.setAttribute('aBreaker',new THREE.InstancedBufferAttribute(new Float32Array([0,1,2]),1))
  geometry.setIndex(indices)
  return geometry
}
