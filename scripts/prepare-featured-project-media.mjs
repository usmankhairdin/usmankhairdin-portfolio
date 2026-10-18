// Prepare genuine CUA browser captures. Only crops, resizes and WebP encoding;
// no interface content is generated or repainted. Animated off-screen sections
// are assembled from their settled visible viewports, with sticky chrome once.
import {createRequire} from 'node:module'
import {mkdir,readFile,access} from 'node:fs/promises'
import path from 'node:path'

const require=createRequire(import.meta.url)
const sharp=require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const input=path.resolve(process.argv[2])
const outputs={
  forma:{background:'#090b1c',evidence:{workspace:1,workflow:9,integrations:16,pricing:18}},
  veyravael:{background:'#f3f1e9',evidence:{collection:2,perspective:4,destinations:5,enquiry:7}},
}
for(const [slug,config] of Object.entries(outputs)){
  const out=path.resolve('public/assets/projects',slug)
  await mkdir(out,{recursive:true})
  const strips=JSON.parse(await readFile(path.join(input,`${slug}-strips.json`),'utf8'))
  const first=await sharp(strips[0].file).metadata()
  const height=Math.ceil(strips[0].height)
  const layers=[]
  let covered=0
  for(const [index,strip] of strips.entries()){
    const top=index?100:0,y=Math.round(strip.y)+top
    if(y>covered)throw new Error(`${slug}: uncaptured gap ${covered}..${y}`)
    const cropHeight=Math.min(first.height-top,height-y)
    if(cropHeight<=0)continue
    const content=await sharp(strip.file).extract({left:0,top,width:first.width,height:cropHeight}).png().toBuffer()
    layers.push({input:content,left:0,top:y})
    covered=Math.max(covered,y+cropHeight)
  }
  if(height-covered>2)throw new Error(`${slug}: footer not captured`)
  const fullpage=await sharp({create:{width:first.width,height,channels:3,background:config.background}}).composite(layers).png().toBuffer()
  await sharp(fullpage).resize({width:1440}).webp({quality:89,effort:5}).toFile(path.join(out,'fullpage.webp'))
  const hero=path.resolve(`public/assets/rooms/work/${slug}.webp`)
  for(const name of ['hero','showcase','showcase-1x'])await sharp(hero).webp({quality:90,effort:5}).toFile(path.join(out,`${name}.webp`))
  await sharp(path.join(input,`${slug}-mobile.png`)).webp({quality:90,effort:5}).toFile(path.join(out,'mobile.webp'))
  for(const [name,index] of Object.entries(config.evidence)){
    await sharp(strips[index].file).webp({quality:90,effort:5}).toFile(path.join(out,`ev-${name}.webp`))
    await sharp(strips[index].file).resize({width:960}).webp({quality:88,effort:5}).toFile(path.join(out,`ev-${name}-1x.webp`))
  }
  const detail=slug==='forma'?'workspace':'collection'
  await sharp(path.join(out,`ev-${detail}.webp`)).webp({quality:90,effort:5}).toFile(path.join(out,'detail.webp'))
  await mkdir('public/assets/social',{recursive:true})
  await sharp(hero).resize(1200,630,{fit:'contain',background:config.background}).jpeg({quality:90}).toFile(`public/assets/social/${slug}.jpg`)
  console.log(`${slug}: ${strips.length} viewports, ${first.width}x${height} full page, hero + phone + 4 evidence captures`)
}
const corridor=path.resolve(input,'../work-room-live-2026-10-18/work-room-single-mode-final.png')
await sharp(corridor).resize(1440,900,{fit:'cover',position:'centre'}).webp({quality:91,effort:5}).toFile('public/assets/case-studies/personal-portfolio-3d/room-work-current.webp')

// Local Forma source provides a settled, continuous documentation view. It
// avoids stitching repeated headings from its normal pinned scroll sequences.
const localForma=path.join(input,'forma-local-fullpage.png')
if(await access(localForma).then(()=>true,()=>false)){
  const out=path.resolve('public/assets/projects/forma')
  await sharp(localForma).webp({quality:90,effort:5}).toFile(path.join(out,'fullpage.webp'))
  await sharp(path.join(input,'forma-local-mobile.jpg')).webp({quality:90,effort:5}).toFile(path.join(out,'mobile.webp'))
  const regions={workspace:[1510,900],workflow:[2400,1320],integrations:[5976,1157],pricing:[7133,1157]}
  for(const [name,[top,height]] of Object.entries(regions)){
    const crop=await sharp(localForma).extract({left:0,top,width:1440,height}).png().toBuffer()
    await sharp(crop).webp({quality:90,effort:5}).toFile(path.join(out,`ev-${name}.webp`))
    await sharp(crop).resize({width:960}).webp({quality:88,effort:5}).toFile(path.join(out,`ev-${name}-1x.webp`))
  }
  await sharp(path.join(out,'ev-workspace.webp')).webp({quality:90}).toFile(path.join(out,'detail.webp'))
  console.log('Forma: continuous local full page + responsive phone + settled sections')
}
