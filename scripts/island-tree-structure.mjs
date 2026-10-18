import * as THREE from 'three'

const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)]

// Keep the scanned trunk's bend, while a continuous bark collar carries the
// basal silhouette through every LOD. This is wood, not an opaque soil disk:
// the lobed foot sinks just under ground and tapers into the source forks.
export function createTreeSupport(source,species){
  const p=source.attributes.position,levels=[-.012,.008,.034,.085,.16,.25,.35,.45,.56],sides=12
  const positions=[],uvs=[],indices=[],centers=[]
  for(const y of levels){
    const xs=[],zs=[]
    for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)-Math.max(.015,y))<.04){xs.push(p.getX(i));zs.push(p.getZ(i))}
    const previous=centers.at(-1)||[0,0]
    // In the branched upper scan a broad fork can pull a simple centroid far
    // off the leader. A capped median retains a smooth connected main stem.
    const blend=y<.04?.15:1,limit=y<.085?.015:.055
    const toward=(value,prior)=>prior+Math.max(-limit,Math.min(limit,(value-prior)*blend))
    centers.push(xs.length?[toward(median(xs),previous[0]),toward(median(zs),previous[1])]:previous)
  }
  const girth=species==='coastal'?.040:.034
  for(let ring=0;ring<levels.length;ring++){
    const y=levels[ring],stem=girth*(1-.70*Math.min(1,Math.max(0,y)/.56)),flare=Math.exp(-Math.max(0,y)/.035)*.028
    const [cx,cz]=centers[ring]
    for(let i=0;i<=sides;i++){
      const theta=i/sides*Math.PI*2,lobes=.55+.3*Math.cos(theta*3+.7)+.15*Math.sin(theta*5+.9)
      const radius=stem*(1+.08*Math.sin(theta*3+y*9)) +flare*lobes
      positions.push(cx+Math.cos(theta)*radius,y,cz+Math.sin(theta)*radius)
      uvs.push(i/sides*1.5,y*3)
      if(ring<levels.length-1&&i<sides){const a=ring*(sides+1)+i,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1)}
    }
  }
  // The hidden foot and crown end are capped. Side triangles retain correct
  // outward winding, so the solid trunk also survives ordinary backface cull.
  for(const ring of [0,levels.length-1]){
    const [cx,cz]=centers[ring],middle=positions.length/3;positions.push(cx,levels[ring],cz);uvs.push(.5,.5)
    for(let i=0;i<sides;i++){const a=ring*(sides+1)+i;indices.push(...(ring===0?[middle,a,a+1]:[middle,a+1,a]))}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals()
  return g
}

// Native-size contours keep their original 3-D curvature. In particular, a
// sparse leaf sample is never inflated to stand in for an entire branch.
export function nativeLeafSubset(input,count){
  const p=input.attributes.position,n=input.attributes.normal,uv=input.attributes.uv,leaves=p.count/7
  count=Math.min(count,leaves)
  const positions=[],normals=[],uvs=[],indices=[]
  for(let k=0;k<count;k++){
    const first=Math.floor(k*leaves/count)*7,base=positions.length/3
    for(let i=0;i<7;i++){const id=first+i;positions.push(p.getX(id),p.getY(id),p.getZ(id));normals.push(n.getX(id),n.getY(id),n.getZ(id));uvs.push(uv.getX(id),uv.getY(id))}
    for(let i=0;i<6;i++)indices.push(base,base+1+i,base+1+(i+1)%6)
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);return g
}
