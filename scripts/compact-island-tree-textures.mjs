import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url),sharp=require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const folder='public/assets/forest/textures'
for(const file of fs.readdirSync(folder)){
 const p=path.join(folder,file),input=fs.readFileSync(p)
 const pixels=file.includes('grove')?768:file.includes('canopy')?1024:file.endsWith('.jpg')?512:768
 const result=await sharp(input).resize({width:pixels,height:pixels,fit:'inside',withoutEnlargement:true}).png({palette:file.includes('canopy')||file.includes('grove'),quality:92}).toBuffer()
 fs.writeFileSync(p,file.endsWith('.jpg')?await sharp(result).jpeg({quality:84}).toBuffer():result)
}
