import * as THREE from 'three'

export const WEBSITE_VIEWPORT={width:1440,height:900}
const position=new THREE.Vector3(),normal=new THREE.Vector3(),eye=new THREE.Vector3()
const frustum=new THREE.Frustum(),projection=new THREE.Matrix4()
const clipMatrix=new THREE.Matrix4()

// One projective transform maps browser pixels directly to the LED's four
// projected corners. A flat parent avoids nested-preserve-3d iframe hit-test
// and compositing errors, without changing the physical perspective.
export function websiteProjection(worldMatrix,width,height,camera,viewportWidth,viewportHeight,target=new THREE.Matrix4()){
  const m=clipMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(worldMatrix).elements
  const sx=width/WEBSITE_VIEWPORT.width,sy=-height/WEBSITE_VIEWPORT.height,ox=-width/2,oy=height/2
  const xu=m[0]*sx,xv=m[4]*sy,xc=m[0]*ox+m[4]*oy+m[12]
  const yu=m[1]*sx,yv=m[5]*sy,yc=m[1]*ox+m[5]*oy+m[13]
  const wu=m[3]*sx,wv=m[7]*sy,wc=m[3]*ox+m[7]*oy+m[15]
  // A positive normalization preserves the clip-W sign when a close screen
  // crosses the camera plane; negative W must stay behind the browser camera.
  const scale=Math.max(Math.abs(wc),1e-8)
  return target.set((xu+wu)*viewportWidth/2/scale,(xv+wv)*viewportWidth/2/scale,0,(xc+wc)*viewportWidth/2/scale,
    (wu-yu)*viewportHeight/2/scale,(wv-yv)*viewportHeight/2/scale,0,(wc-yc)*viewportHeight/2/scale,
    0,0,1,0,wu/scale,wv/scale,0,wc/scale)
}

// A parallel screen needs only a normal 2D browser transform. Preserve the
// projective transform for oblique views instead of approximating perspective.
export function websiteTransform(matrix){
  const e=matrix.elements,clean=v=>Math.abs(v)<1e-12?0:v
  if(Math.abs(e[3])<1e-12&&Math.abs(e[7])<1e-12&&e[15]>0)
    return `matrix(${[e[0],e[1],e[4],e[5],e[12],e[13]].map(v=>clean(v/e[15])).join(',')})`
  return `matrix3d(${e.map(clean).join(',')})`
}

export function websiteContainsPoint(matrix,x,y){
  const point=new THREE.Vector3(x,y,0).applyMatrix4(matrix.clone().invert())
  return point.x>=0&&point.x<=WEBSITE_VIEWPORT.width&&point.y>=0&&point.y<=WEBSITE_VIEWPORT.height
}

export function canShowWebsite(mesh,camera,inWorkRoom){
  if(!inWorkRoom)return false
  for(let parent=mesh;parent;parent=parent.parent)if(!parent.visible)return false
  position.setFromMatrixPosition(mesh.matrixWorld)
  eye.setFromMatrixPosition(camera.matrixWorld)
  if(eye.distanceToSquared(position)>18*18)return false
  normal.set(0,0,1).transformDirection(mesh.matrixWorld)
  if(normal.dot(eye.sub(position))<=.05)return false
  frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse))
  return frustum.intersectsObject(mesh)
}

// The canvas alpha is already the exact depth-tested aperture. Read it back
// only when an interaction view changes, and convert it to a DOM hit clip.
// CSS masks do not limit hit testing; a real clip-path does.
export function websiteHitRegions(matrix,width,height,camera,pixels,rect,columns=144,rows=90,boundaryOpen){
  const regions=[],p=new THREE.Vector3(),cw=WEBSITE_VIEWPORT.width/columns,ch=WEBSITE_VIEWPORT.height/rows
  const open=(u,v)=>{
    p.set((u-.5)*width,(.5-v)*height,0).applyMatrix4(matrix)
    const boundary=u<=1/columns||u>=1-1/columns||v<=1/rows||v>=1-1/rows
    if(boundary&&boundaryOpen)return boundaryOpen(p)
    p.project(camera)
    const x=Math.floor((p.x*.5+.5)*rect.bufferWidth)-rect.x,y=Math.floor((p.y*.5+.5)*rect.bufferHeight)-rect.y
    return x>=0&&y>=0&&x<rect.width&&y<rect.height&&pixels[(y*rect.width+x)*4+3]<240
  }
  for(let row=0;row<rows;row++){
    let start=-1
    for(let col=0;col<=columns;col++){
      const u=col/columns,v=row/rows
      const visible=col<columns&&open(u,v)&&open(u+1/columns,v)&&open(u,v+1/rows)&&open(u+1/columns,v+1/rows)&&open(u+.5/columns,v+.5/rows)
      if(visible&&start<0)start=col
      if(!visible&&start>=0){regions.push({x:start*cw,y:row*ch,width:(col-start)*cw,height:ch});start=-1}
    }
  }
  return regions
}

// Rasterized bezel pixels cannot tell us whether an outside cell is covered
// by the bezel itself or by a real gate. Resolve only those boundary samples
// against the room's physical opaque geometry, before the LED plane.
export function websiteBoundaryVisibility(mesh,camera){
  let scope=mesh
  while(scope.parent&&!scope.userData.websiteOcclusionScope)scope=scope.parent
  const blockers=[]
  scope.traverse(o=>{
    if(!o.isMesh||o===mesh)return
    for(let p=o;p;p=p.parent)if(!p.visible)return
    const materials=Array.isArray(o.material)?o.material:[o.material]
    if(materials.some(m=>m?.visible&&!m.transparent&&m.colorWrite!==false))blockers.push(o)
  })
  const origin=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld),direction=new THREE.Vector3(),ray=new THREE.Raycaster()
  return point=>{
    direction.subVectors(point,origin)
    ray.set(origin,direction.clone().normalize());ray.far=direction.length()-.006
    return ray.intersectObjects(blockers,false).length===0
  }
}

// Trace the outside of the aperture once. Separate row rectangles produce
// antialiasing seams and a sawtooth LED border under a perspective transform.
export function websiteClipPath(regions,columns,rows){
  if(!regions.length)return 'inset(50%)'
  const cw=WEBSITE_VIEWPORT.width/columns,ch=WEBSITE_VIEWPORT.height/rows,cells=new Uint8Array(columns*rows)
  for(const r of regions){
    const left=Math.round(r.x/cw),right=Math.round((r.x+r.width)/cw)
    const row=Math.round(r.y/ch)
    if(row>=0&&row<rows)cells.fill(1,row*columns+left,row*columns+right)
  }
  if(cells.every(Boolean))return 'inset(0)'
  const edges=new Map(),stride=columns+1
  const edge=(a,b)=>{if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b)}
  const open=(x,y)=>x>=0&&x<columns&&y>=0&&y<rows&&cells[y*columns+x]
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)if(open(x,y)){
    const a=y*stride+x,b=a+1,c=b+stride,d=a+stride
    if(!open(x,y-1))edge(a,b)
    if(!open(x+1,y))edge(b,c)
    if(!open(x,y+1))edge(c,d)
    if(!open(x-1,y))edge(d,a)
  }
  const paths=[]
  while(edges.size){
    const first=edges.keys().next().value,points=[]
    let at=first
    do{
      points.push([at%stride,Math.floor(at/stride)])
      const next=edges.get(at),end=next.pop()
      if(!next.length)edges.delete(at)
      at=end
    }while(at!==first&&edges.has(at))
    const corners=points.filter((p,i)=>{
      const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length]
      return (p[0]-prev[0])*(next[1]-p[1])!==(p[1]-prev[1])*(next[0]-p[0])
    })
    if(corners.length)paths.push(corners.map((p,i)=>`${i?'L':'M'}${(p[0]*cw).toFixed(4)},${(p[1]*ch).toFixed(4)}`).join('')+'Z')
  }
  return `path('${paths.join('')}')`
}

export function websiteHitClip(renderer,mesh,width,height,camera){
  const size=renderer.getDrawingBufferSize(new THREE.Vector2()),point=new THREE.Vector3(),corners=[]
  for(const x of [-.5,.5])for(const y of [-.5,.5])corners.push(point.set(x*width,y*height,0).applyMatrix4(mesh.matrixWorld).project(camera).clone())
  const x=Math.max(0,Math.floor(Math.min(...corners.map(p=>(p.x*.5+.5)*size.x))-1))
  const y=Math.max(0,Math.floor(Math.min(...corners.map(p=>(p.y*.5+.5)*size.y))-1))
  const right=Math.min(size.x,Math.ceil(Math.max(...corners.map(p=>(p.x*.5+.5)*size.x))+1))
  const top=Math.min(size.y,Math.ceil(Math.max(...corners.map(p=>(p.y*.5+.5)*size.y))+1))
  if(right<=x||top<=y)return 'inset(50%)'
  const rect={x,y,width:right-x,height:top-y,bufferWidth:size.x,bufferHeight:size.y},pixels=new Uint8Array(rect.width*rect.height*4)
  const context=renderer.getContext()
  context.readPixels(x,y,rect.width,rect.height,context.RGBA,context.UNSIGNED_BYTE,pixels)
  const columns=Math.max(72,Math.min(384,Math.round(rect.width))),rows=Math.max(45,Math.round(columns*height/width))
  const regions=websiteHitRegions(mesh.matrixWorld,width,height,camera,pixels,rect,columns,rows,websiteBoundaryVisibility(mesh,camera))
  return websiteClipPath(regions,columns,rows)
}
