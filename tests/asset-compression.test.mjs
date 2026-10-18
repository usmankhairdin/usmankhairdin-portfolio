import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {test} from 'node:test'
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js'

test('runtime forest is compressed and decodes every original vertex/index byte without loss',async()=>{
  const model=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8'))
  assert.ok(model.extensionsRequired?.includes('EXT_meshopt_compression'),'runtime forest must use lossless buffer compression')
  const binary=await readFile('public/assets/forest/island-trees.bin')
  assert.ok(binary.length<25_381_868*.7,'lossless encoding must remove at least 30 percent of the source geometry bytes')
  await MeshoptDecoder.ready
  const hash=createHash('sha256')
  for(const view of model.bufferViews){
    const ext=view.extensions.EXT_meshopt_compression
    const decoded=new Uint8Array(view.byteLength)
    MeshoptDecoder.decodeGltfBuffer(decoded,ext.count,ext.byteStride,binary.subarray(ext.byteOffset,ext.byteOffset+ext.byteLength),ext.mode,ext.filter)
    hash.update(decoded)
  }
  assert.equal(hash.digest('hex'),'4c936419d73d356bd8dbfa4f368d254955185ba8074138387b265c36e026f0ea','all 88 decoded views must exactly match the approved uncompressed model')
})
