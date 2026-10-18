import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export async function gltfBufferViews(asset,binary){
  await MeshoptDecoder.ready
  return asset.bufferViews.map(view=>{
    const ext=view.extensions?.EXT_meshopt_compression
    if(!ext)return binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength)
    const decoded=new Uint8Array(view.byteLength)
    MeshoptDecoder.decodeGltfBuffer(decoded,ext.count,ext.byteStride,binary.subarray(ext.byteOffset,ext.byteOffset+ext.byteLength),ext.mode,ext.filter)
    return decoded
  })
}
