import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url)
const sharp=require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const source=process.argv[2]||'D:/UKD/public/assets/city/airport/cessna172-runtime.glb'
const output='public/assets/city/airport/cessna172-runtime.glb',bytes=fs.readFileSync(source)
const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength)),oldBinary=bytes.subarray(28+jsonLength)
const chunks=[oldBinary];let offset=oldBinary.length
for(const image of json.images){
  const view=json.bufferViews[image.bufferView],input=oldBinary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength)
  const resized=await sharp(input).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer()
  const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad}
  image.bufferView=json.bufferViews.length;image.mimeType='image/jpeg';json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:resized.length});chunks.push(resized);offset+=resized.length
}
// Repack only the accessors and images still referenced after texture resizing.
const used=new Set([...json.accessors.map(a=>a.bufferView),...json.images.map(i=>i.bufferView)])
const all=Buffer.concat(chunks),packed=[],mapping=new Map(),views=[];let size=0
for(const i of used){const v=json.bufferViews[i],pad=(4-size%4)%4;if(pad){packed.push(Buffer.alloc(pad));size+=pad}mapping.set(i,views.length);views.push({...v,byteOffset:size});packed.push(all.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength));size+=v.byteLength}
for(const a of json.accessors)a.bufferView=mapping.get(a.bufferView)
for(const i of json.images)i.bufferView=mapping.get(i.bufferView)
json.bufferViews=views;json.buffers[0].byteLength=size
const j=Buffer.from(JSON.stringify(json)),jp=Buffer.alloc((j.length+3)&~3,32);j.copy(jp)
const b=Buffer.concat(packed),bp=Buffer.alloc((b.length+3)&~3);b.copy(bp)
const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8)
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jp.length+8+bp.length,8)
jh.writeUInt32LE(jp.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bp.length);bh.writeUInt32LE(0x004e4942,4)
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,Buffer.concat([header,jh,jp,bh,bp]));console.log({aircraftBytes:fs.statSync(output).size})
