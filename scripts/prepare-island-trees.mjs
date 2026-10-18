import fs from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import { bakeForestCanopy } from './bake-island-canopy.mjs'
import { createTreeSupport, nativeLeafSubset } from './island-tree-structure.mjs'
import { islandTreeLocalPoint } from '../src/rooms/islandTreeShape.js'
import { compressGltfFile } from './compress-gltf.mjs'

// UKD is a read-only source. Browser geometry keeps source leaf curvature close
// and full scanned crown coverage in many small spatial branch clusters far away.
const sourceFolder=path.resolve(process.argv[2]||'D:/UKD/public/assets/forest')
const artifactFolder=path.resolve(sourceFolder,'../../../.artifacts')
const outputFolder=path.resolve('public/assets/forest')
const source=JSON.parse(fs.readFileSync(path.join(sourceFolder,'natural-trees.gltf')))
const binary=fs.readFileSync(path.join(sourceFolder,source.buffers[0].uri))
const output={asset:{version:'2.0',generator:'Native source leaves, scanned branch skeletons and continuous structural bark'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],images:[],textures:[],samplers:source.samplers,accessors:[],bufferViews:[],buffers:[],extras:{variants:[],profileDeformation:'islandTreeLocalPoint',nativeLeafScale:true},extensionsUsed:['KHR_texture_transform']}
const chunks=[],imageMap=new Map(),textureMap=new Map()
let offset=0
const widths={SCALAR:1,VEC2:2,VEC3:3},types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}
fs.mkdirSync(path.join(outputFolder,'textures'),{recursive:true})
for(const material of source.materials){
  const copy=structuredClone(material),texture=copy.pbrMetallicRoughness.baseColorTexture
  delete copy.normalTexture;delete copy.occlusionTexture;delete copy.pbrMetallicRoughness.metallicRoughnessTexture
  copy.pbrMetallicRoughness.roughnessFactor=.96
  const oldTexture=source.textures[texture.index]
  if(!textureMap.has(texture.index)){
    if(!imageMap.has(oldTexture.source)){
      const image=source.images[oldTexture.source]
      imageMap.set(oldTexture.source,output.images.length);output.images.push(image)
      fs.copyFileSync(path.join(sourceFolder,image.uri),path.join(outputFolder,image.uri))
    }
    textureMap.set(texture.index,output.textures.length)
    output.textures.push({...oldTexture,source:imageMap.get(oldTexture.source)})
  }
  texture.index=textureMap.get(texture.index)
  output.materials.push(copy)
}
function readGeometry(asset,bytes,primitive){
  const read=index=>{const a=asset.accessors[index],view=asset.bufferViews[a.bufferView],Type=types[a.componentType],start=bytes.byteOffset+(view.byteOffset||0)+(a.byteOffset||0);return new THREE.BufferAttribute(new Type(bytes.buffer.slice(start,start+a.count*widths[a.type]*Type.BYTES_PER_ELEMENT)),widths[a.type])}
  const geometry=new THREE.BufferGeometry()
  for(const [key,name] of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv']])geometry.setAttribute(name,read(primitive.attributes[key]))
  geometry.setIndex(read(primitive.indices));return geometry
}
function put(attribute,target){
  const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad}
  const bytes=Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength),view=output.bufferViews.length
  output.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});chunks.push(bytes);offset+=bytes.length
  const min=[],max=[]
  for(let k=0;k<attribute.itemSize;k++){let low=Infinity,high=-Infinity;for(let i=k;i<attribute.array.length;i+=attribute.itemSize){low=Math.min(low,attribute.array[i]);high=Math.max(high,attribute.array[i])}min.push(low);max.push(high)}
  output.accessors.push({bufferView:view,componentType:attribute.array instanceof Float32Array?5126:attribute.array instanceof Uint32Array?5125:5123,count:attribute.count,type:Object.keys(widths).find(k=>widths[k]===attribute.itemSize),min,max})
  return output.accessors.length-1
}
const geometryAccessors=new WeakMap()
function writeGeometry(geometry,material){
  if(geometryAccessors.has(geometry))return {...geometryAccessors.get(geometry),material}
  const attributes={};for(const [name,key] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']])attributes[key]=put(geometry.attributes[name],34962)
  const data={attributes,indices:put(geometry.index,34963)};geometryAccessors.set(geometry,data)
  return {...data,material}
}
function shape(input,profile,root,height,radial){
  const g=input.clone(),p=g.attributes.position
  for(let i=0;i<p.count;i++){
    let x=p.getX(i)/height,y=(p.getY(i)-root)/height,z=p.getZ(i)/height
    const t=Math.max(0,Math.min(1,y)),branch=t*t*(3-2*t)
    if(profile===1){x=x*.81+.16*t*t;z=z*1.06-.055*branch;y=Math.pow(t,.9)}
    if(profile===2){x=x*1.17+.065*Math.sin(t*5.4)*branch;z=z*.88+.09*branch;y=y*(.93+.07*Math.cos(x*3.1))}
    p.setXYZ(i,x*radial,y,z*radial)
  }
  g.computeVertexNormals();return g
}
const farCrowns=new Map()
for(const [species,folder,baseName]of[['burkea','forest-broadleaf','tree_small_02'],['coastal','forest-coastal','island_tree_01']]){
  const folderPath=path.join(artifactFolder,folder),asset=JSON.parse(fs.readFileSync(path.join(folderPath,'tree.gltf'))),bytes=fs.readFileSync(path.join(folderPath,baseName+'.bin'))
  const raw=asset.meshes[0].primitives.map(p=>readGeometry(asset,bytes,p)),leafIndex=asset.meshes[0].primitives.findIndex(p=>asset.materials[p.material].name.includes('leaves'))
  raw.forEach(g=>g.computeBoundingBox())
  const root=Math.min(...raw.map(g=>g.boundingBox.min.y)),height=Math.max(...raw.map(g=>g.boundingBox.max.y))-root
  const canopy=await bakeForestCanopy(raw[leafIndex],folderPath,outputFolder,{cellSize:height*.21,name:`${species}-canopy`,colorPath:`textures/${baseName}_leaves_diff_1k.jpg`})
  const grove=await bakeForestCanopy(raw[leafIndex],folderPath,outputFolder,{cellSize:height*.42,name:`${species}-grove`,colorPath:`textures/${baseName}_leaves_diff_1k.jpg`})
  const nearLeafIndex=source.materials.findIndex(m=>m.name.includes(species==='burkea'?'tree_small_02_leaves':'island_tree_01_leaves'))
  const material=structuredClone(output.materials[nearLeafIndex]),texture=output.textures.length,image=output.images.length
  output.images.push({uri:`textures/${species}-canopy.png`,mimeType:'image/png'});output.textures.push({source:image,sampler:0})
  material.name+= '-full-canopy';material.pbrMetallicRoughness.baseColorTexture={index:texture};material.alphaCutoff=.3
  const materialIndex=output.materials.length;output.materials.push(material)
  const groveImage=output.images.length,groveTexture=output.textures.length,groveMaterial=structuredClone(material)
  output.images.push({uri:`textures/${species}-grove.png`,mimeType:'image/png'});output.textures.push({source:groveImage,sampler:0})
  groveMaterial.pbrMetallicRoughness.baseColorTexture={index:groveTexture};groveMaterial.name+='-grove'
  const groveMaterialIndex=output.materials.length;output.materials.push(groveMaterial)
  farCrowns.set(species,{canopy,grove,root,height,materialIndex,groveMaterialIndex})
  raw.forEach(g=>g.dispose())
}
for(const species of ['burkea','coastal']){
  const variants=source.extras.variants.filter(v=>v.species===species),reference=variants.find(v=>v.profile===0)
  const nearMesh=source.meshes[reference.meshes[0]],middleMesh=source.meshes[reference.meshes[1]],farMesh=source.meshes[reference.meshes[2]]
  const near=nearMesh.primitives.map(p=>readGeometry(source,binary,p)),middleWood=middleMesh.primitives.map(p=>readGeometry(source,binary,p)),far=farMesh.primitives.map(p=>readGeometry(source,binary,p))
  const leafIndex=nearMesh.primitives.findIndex(p=>source.materials[p.material].name.includes('leaves')),trunkIndex=nearMesh.primitives.findIndex(p=>{const name=source.materials[p.material].name;return name.includes('trunk')||name==='island_tree_01'})
  const data=farCrowns.get(species),rawShaped=shape(data.canopy,0,data.root,data.height,1)
  let rawRadius=0,referenceRadius=0
  const a=rawShaped.attributes.position,b=near[leafIndex].attributes.position
  for(let i=0;i<a.count;i++)rawRadius=Math.max(rawRadius,Math.hypot(a.getX(i),a.getZ(i)))
  for(let i=0;i<b.count;i++)referenceRadius=Math.max(referenceRadius,Math.hypot(b.getX(i),b.getZ(i)))
  const canopy=rawShaped.scale(referenceRadius/rawRadius,1,referenceRadius/rawRadius)
  const grove=shape(data.grove,0,data.root,data.height,referenceRadius/rawRadius)
  let groveRadius=0
  for(let i=0;i<grove.attributes.position.count;i++)groveRadius=Math.max(groveRadius,Math.hypot(grove.attributes.position.getX(i),grove.attributes.position.getZ(i)))
  grove.scale(referenceRadius/groveRadius,1,referenceRadius/groveRadius)
  // Atlas rectangles include transparent edge padding outside actual leaves.
  // Keep those conservative cluster planes within the tree's advertised height.
  for(const crown of [canopy,grove]){
    crown.computeBoundingBox()
    if(crown.boundingBox.max.y>1)crown.scale(1,.999/crown.boundingBox.max.y,1)
  }
  // Smooth the distant branch-cluster lighting over the scanned crown envelope;
  // individual planes must not flash as the camera moves around the gallery.
  const cp=canopy.attributes.position,cn=canopy.attributes.normal,v=new THREE.Vector3()
  for(let i=0;i<cp.count;i++){v.set(cp.getX(i),.22+(cp.getY(i)-.5)*.6,cp.getZ(i)).normalize();cn.setXYZ(i,v.x,v.y,v.z)}
  const gp=grove.attributes.position,gn=grove.attributes.normal
  for(let i=0;i<gp.count;i++){v.set(gp.getX(i),.22+(gp.getY(i)-.5)*.6,gp.getZ(i)).normalize();gn.setXYZ(i,v.x,v.y,v.z)}
  const core=createTreeSupport(near[trunkIndex],species),bark=structuredClone(output.materials[nearMesh.primitives[trunkIndex].material]),barkIndex=output.materials.length
  bark.name=`${species}-structural-bark`;delete bark.pbrMetallicRoughness.baseColorTexture.extensions;output.materials.push(bark)
  const middle=near.map((g,i)=>i===leafIndex?nativeLeafSubset(g,6000):middleWood[i])
  const distant=far.map((g,i)=>i===leafIndex?canopy:g),sparse=far.map((g,i)=>i===leafIndex?grove:g)
  const meshes=[],triangles=[]
  for(const [lod,parts]of [near,middle,distant,sparse].entries()){
    const name=`${species}-native-${['source','middle','distant','grove'][lod]}`,mesh=output.meshes.length
    const primitives=parts.map((g,i)=>writeGeometry(g,lod>=2&&i===leafIndex?(lod===2?data.materialIndex:data.groveMaterialIndex):nearMesh.primitives[i].material))
    // Middle foliage keeps native leaves, with the complete smaller branch
    // clusters behind them rather than stretching each remaining leaf.
    if(lod===1)primitives.push(writeGeometry(canopy,data.materialIndex))
    primitives.push(writeGeometry(core,barkIndex))
    output.meshes.push({name,primitives});output.nodes.push({name,mesh});output.scenes[0].nodes.push(output.nodes.length-1);meshes.push(mesh)
    triangles.push(primitives.reduce((sum,p)=>sum+output.accessors[p.indices].count/3,0))
  }
  for(const variant of variants){
    let radius=0
    const p=near[leafIndex].attributes.position
    for(const geometry of [...near,...middle,...distant,...sparse,core]){
      const vertices=geometry.attributes.position
      for(let i=0;i<vertices.count;i++){const point=islandTreeLocalPoint({x:vertices.getX(i),y:vertices.getY(i),z:vertices.getZ(i)},variant.profile);radius=Math.max(radius,Math.hypot(point.x,point.z))}
    }
    const radialScale=Math.min(1,.645/radius)
    output.extras.variants.push({id:variant.id,species,profile:variant.profile,height:1,radius:.65,radialScale,meshes,triangles,nativeLeafContours:p.count/7,rootContact:'embedded-bark'})
  }
}
output.buffers=[{uri:'island-trees.bin',byteLength:offset}]
fs.writeFileSync(path.join(outputFolder,'island-trees.bin'),Buffer.concat(chunks));fs.writeFileSync(path.join(outputFolder,'island-trees.gltf'),JSON.stringify(output))
console.log(JSON.stringify({geometryBytes:offset,images:output.images.map(i=>i.uri),variants:output.extras.variants}))
await import('./compact-island-tree-textures.mjs')
await compressGltfFile(path.join(outputFolder,'island-trees.gltf'))
