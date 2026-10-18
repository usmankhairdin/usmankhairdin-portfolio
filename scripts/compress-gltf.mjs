import {readFile,writeFile} from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {MeshoptEncoder} from 'meshoptimizer/encoder'

// Lossless EXT encoding: no quantization, triangle reordering, or LOD changes.
export async function compressGltfFile(file){
  const model=JSON.parse(await readFile(file,'utf8'))
  if(model.extensionsRequired?.includes('EXT_meshopt_compression'))return
  if(model.buffers.length!==1)throw new Error('Expected one source geometry buffer')
  const binaryPath=path.resolve(path.dirname(file),model.buffers[0].uri)
  const binary=await readFile(binaryPath),chunks=[]
  const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},bytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}
  let offset=0
  await MeshoptEncoder.ready
  for(const [index,view] of model.bufferViews.entries()){
    const accessor=model.accessors.find(a=>a.bufferView===index)
    if(!accessor)throw new Error(`Unreferenced buffer view ${index}`)
    const stride=view.byteStride||width[accessor.type]*bytes[accessor.componentType]
    const mode=view.target===34963?'INDICES':'ATTRIBUTES',count=view.byteLength/stride
    if(!Number.isInteger(count))throw new Error('Non-integral buffer layout')
    const source=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength)
    const encoded=MeshoptEncoder.encodeGltfBuffer(source,count,stride,mode,0)
    const padding=(4-offset%4)%4
    if(padding){chunks.push(Buffer.alloc(padding));offset+=padding}
    view.buffer=1
    view.extensions={...view.extensions,EXT_meshopt_compression:{buffer:0,byteOffset:offset,byteLength:encoded.byteLength,byteStride:stride,count,mode,filter:'NONE'}}
    chunks.push(encoded);offset+=encoded.byteLength
  }
  model.buffers=[{uri:model.buffers[0].uri,byteLength:offset},{byteLength:binary.length,extensions:{EXT_meshopt_compression:{fallback:true}}}]
  model.extensionsUsed=[...new Set([...(model.extensionsUsed||[]),'EXT_meshopt_compression'])]
  model.extensionsRequired=[...new Set([...(model.extensionsRequired||[]),'EXT_meshopt_compression'])]
  await writeFile(binaryPath,Buffer.concat(chunks));await writeFile(file,JSON.stringify(model))
  console.log(`${file}: ${binary.length} -> ${offset} geometry bytes (lossless)`)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  await compressGltfFile(process.argv[2]||'public/assets/forest/island-trees.gltf')
}
