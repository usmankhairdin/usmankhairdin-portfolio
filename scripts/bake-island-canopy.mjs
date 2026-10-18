import * as THREE from 'three'
import { createRequire } from 'node:module'
import fs from 'node:fs'
const require = createRequire(import.meta.url)
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')

// Project ALL of the original photographic leaves onto small volumetric
// branch clusters. Unlike a bounding rectangle sampled from a single leaf,
// these cards contain the actual coverage of thousands of authored surfaces.
// Three orthogonal slices per cluster retain the canopy from above and below.
export async function bakeForestCanopy(input, folder, output, options = {}) {
  const p=input.attributes.position, uv=input.attributes.uv, index=input.index
  const parent=Int32Array.from({length:p.count},(_,i)=>i)
  const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
  for(let i=0;i<index.count;i+=3){const r=root(index.getX(i));parent[root(index.getX(i+1))]=r;parent[root(index.getX(i+2))]=r}
  const components=new Map()
  for(let i=0;i<p.count;i++){
    const r=root(i);let c=components.get(r)
    if(!c){c={x:0,y:0,z:0,n:0};components.set(r,c)}
    c.x+=p.getX(i);c.y+=p.getY(i);c.z+=p.getZ(i);c.n++
  }
  const clusters=[], cells=new Map()
  for(const [r,c]of components){
    const key=[c.x/c.n,c.y/c.n,c.z/c.n].map(v=>Math.floor(v/(options.cellSize || .66))).join(',')
    if(!cells.has(key)){cells.set(key,clusters.length);clusters.push({min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity],tris:[]})}
    c.cluster=cells.get(key)
  }
  for(let i=0;i<p.count;i++){
    const c=clusters[components.get(root(i)).cluster]
    for(let k=0;k<3;k++){const v=p.array[i*3+k];c.min[k]=Math.min(c.min[k],v);c.max[k]=Math.max(c.max[k],v)}
  }
  for(let i=0;i<index.count;i+=3)clusters[components.get(root(index.getX(i))).cluster].tris.push(i)
  const rgb=await sharp(`${folder}/${options.colorPath || 'textures/tree_small_02_leaves_diff_1k.jpg'}`).removeAlpha().raw().toBuffer()
  const alpha=options.opaque ? Buffer.alloc(1024*1024,255) : await sharp(`${folder}/leaves-alpha.png`).greyscale().raw().toBuffer()
  const tile=128, tiles=clusters.length*3, columns=Math.ceil(Math.sqrt(tiles)), rows=Math.ceil(tiles/columns), width=columns*tile,height=rows*tile
  const rgba=Buffer.alloc(width*height*4), depths=new Float32Array(width*height).fill(-Infinity)
  const positions=[],uvs=[],indices=[]
  const views=[[0,1,2],[2,1,0],[0,2,1]]
  let sourceArea=0, coveredPixels=0
  for(let ci=0;ci<clusters.length;ci++){
    const c=clusters[ci],center=c.min.map((v,k)=>(v+c.max[k])/2)
    for(let vi=0;vi<3;vi++){
      const [au,av,ad]=views[vi], ti=ci*3+vi,ox=(ti%columns)*tile,oy=Math.floor(ti/columns)*tile
      const spanU=Math.max(.08,c.max[au]-c.min[au])*1.12, spanV=Math.max(.08,c.max[av]-c.min[av])*1.12
      for(const offset of c.tris){
        const ids=[0,1,2].map(k=>index.getX(offset+k))
        const xx=ids.map(i=>(p.array[i*3+au]-center[au])/spanU*tile+tile/2)
        const yy=ids.map(i=>tile/2-(p.array[i*3+av]-center[av])/spanV*tile)
        const det=(yy[1]-yy[2])*(xx[0]-xx[2])+(xx[2]-xx[1])*(yy[0]-yy[2])
        if(Math.abs(det)<1e-10)continue
        const x0=Math.max(1,Math.floor(Math.min(...xx))),x1=Math.min(tile-2,Math.ceil(Math.max(...xx)))
        const y0=Math.max(1,Math.floor(Math.min(...yy))),y1=Math.min(tile-2,Math.ceil(Math.max(...yy)))
        for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const a=((yy[1]-yy[2])*(x+.5-xx[2])+(xx[2]-xx[1])*(y+.5-yy[2]))/det
          const b=((yy[2]-yy[0])*(x+.5-xx[2])+(xx[0]-xx[2])*(y+.5-yy[2]))/det
          const d=1-a-b;if(a<0||b<0||d<0)continue
          const weights=[a,b,d],depth=ids.reduce((s,i,k)=>s+p.array[i*3+ad]*weights[k],0)
          const target=(oy+y)*width+ox+x;if(depth<=depths[target])continue
          const u=ids.reduce((s,i,k)=>s+uv.getX(i)*weights[k],0),v=ids.reduce((s,i,k)=>s+uv.getY(i)*weights[k],0)
          const tx=Math.max(0,Math.min(1023,Math.floor(u*1024))),ty=Math.max(0,Math.min(1023,Math.floor(v*1024))),sample=ty*1024+tx
          if(alpha[sample]<50)continue
          const dst=target*4,src=sample*3
          rgba[dst]=rgb[src];rgba[dst+1]=rgb[src+1];rgba[dst+2]=rgb[src+2];rgba[dst+3]=255;depths[target]=depth
        }
      }
      const base=positions.length/3
      for(const [u,v]of[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){
        const point=[...center];point[au]+=u*spanU;point[av]+=v*spanV;positions.push(...point)
      }
      // glTF UV origin is the upper left of the source image.
      uvs.push(ox/width,(oy+tile)/height,(ox+tile)/width,(oy+tile)/height,(ox+tile)/width,oy/height,ox/width,oy/height)
      indices.push(base,base+1,base+2,base,base+2,base+3)
    }
  }
  for(let i=3;i<rgba.length;i+=4)if(rgba[i])coveredPixels++
  // Dilate RGB into transparent texels without changing alpha. This removes
  // black outlines from minification while keeping every leaf gap transparent.
  for(let pass=0;pass<3;pass++){
    const previous=Buffer.from(rgba)
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=(y*width+x)*4;if(previous[i+3])continue
      for(const d of[-4,4,-width*4,width*4])if(previous[i+d+3]||previous[i+d]+previous[i+d+1]+previous[i+d+2]>0){rgba[i]=previous[i+d];rgba[i+1]=previous[i+d+1];rgba[i+2]=previous[i+d+2];break}
    }
  }
  const name=options.name || 'canopy-clusters'
  await sharp(rgba,{raw:{width,height,channels:4}}).png().toFile(`${output}/textures/${name}.png`)
  const result=new THREE.BufferGeometry()
  result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));result.setIndex(indices);result.computeVertexNormals()
  const metrics={canopyClusters:clusters.length,sourceLeafComponents:components.size,sourceLeafTriangles:index.count/3,bakedTriangles:indices.length/3,atlas:[width,height],coveredPixels,coverage:coveredPixels/(tiles*tile*tile)}
  fs.writeFileSync(`${output}/${name === 'canopy-clusters' ? 'canopy' : name}-metrics.json`,JSON.stringify(metrics,null,2))
  console.log(JSON.stringify(metrics))
  return result
}
