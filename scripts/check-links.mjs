import {literalDemoDependencies} from './demo-dependencies.mjs'
import fs from 'node:fs/promises'
import path from 'node:path'
import {projects,featuredProjects} from '../src/data/projects.js'
import {CASE_STUDIES} from '../src/data/projectCaseStudies.js'
import {seoPaths} from '../src/seo/routeSeo.js'

const root=process.cwd(),publicRoot=path.join(root,'public'),assets=new Set(),external=new Set(),issues=[]
const publicFiles=[]
async function walk(folder){const result=[];for(const e of await fs.readdir(folder,{withFileTypes:true})){const p=path.join(folder,e.name);if(e.isDirectory())result.push(...await walk(p));else result.push(p)}return result}
function collect(value){
  if(typeof value==='string'){
    for(const match of value.matchAll(/\/assets\/[^\s,'"`<>]+/g))if(/\.[a-z\d]+(?:\?|$)/i.test(match[0])&&!match[0].includes('${'))assets.add(match[0].split('?')[0])
  }else if(Array.isArray(value))value.forEach(collect)
  else if(value&&typeof value==='object')Object.values(value).forEach(collect)
}
collect(projects);collect(featuredProjects);collect(CASE_STUDIES)
for(const project of projects){external.add(project.liveUrl);if(project.appUrl)external.add(project.appUrl)}
for(const file of await walk(path.join(root,'src'))){
  if(!/\.(jsx?|css)$/.test(file))continue
  const source=await fs.readFile(file,'utf8');collect(source)
  if(/(?:Footer|Header|HomeExperience)\.jsx$/.test(file))for(const m of source.matchAll(/https:\/\/[^\s'"`<>]+/g))external.add(m[0])
}
for(const project of projects)for(const file of ['showcase.webp','showcase-1x.webp'])assets.add(`/assets/projects/${project.slug}/${file}`)
for(const file of await walk(publicRoot)){
  publicFiles.push(file)
  if(file.endsWith('.gltf')){
    const model=JSON.parse(await fs.readFile(file,'utf8'))
    for(const {uri} of [...(model.buffers||[]),...(model.images||[])])if(uri&&!uri.startsWith('data:'))assets.add('/'+path.relative(publicRoot,path.resolve(path.dirname(file),uri)).replaceAll('\\','/'))
  }
}
const exactFiles=new Set(publicFiles.map(p=>'/'+path.relative(publicRoot,p).replaceAll('\\','/')))
const lowerFiles=new Map([...exactFiles].map(p=>[p.toLowerCase(),p]))
for(const uri of assets){
  const decoded=decodeURIComponent(uri)
  if(!exactFiles.has(decoded))issues.push({type:lowerFiles.has(decoded.toLowerCase())?'asset-case':'missing-asset',url:uri,actual:lowerFiles.get(decoded.toLowerCase())})
}
let demoReferences=0
for(const file of publicFiles.filter(p=>/\.(html|css|js)$/.test(p)&&p.includes(`${path.sep}portfolio${path.sep}`))){
  const text=await fs.readFile(file,'utf8'),sourcePath='/'+path.relative(publicRoot,file).replaceAll('\\','/')
  // HTML strings in a classic JS file resolve against its host document,
  // whereas CSS url() resolves against the stylesheet itself.
  const base=file.endsWith('.js')?sourcePath.split('/').slice(0,3).join('/')+'/index.html':sourcePath
  for(const url of literalDemoDependencies(text,{javascript:file.endsWith('.js')})){
    // Avenlo also contains template fragments crossing a backtick boundary.
    if(sourcePath.startsWith('/portfolio/avenlo/')&&file.endsWith('.js')&&url.includes('`'))continue
    if(/^(?:https?:|data:|mailto:|tel:|javascript:|#)/i.test(url))continue
    const target=decodeURIComponent(new URL(url,'https://local.test'+base).pathname)
    const resolved=target.endsWith('/')?target+'index.html':target
    demoReferences++
    if(!exactFiles.has(resolved))issues.push({type:lowerFiles.has(resolved.toLowerCase())?'demo-case':'missing-demo-dependency',from:base,url,actual:lowerFiles.get(resolved.toLowerCase())})
  }
}
const routes=[...new Set([...seoPaths,'/web/','/home-classic/','/work/personal-portfolio-web/'])]
const base=process.env.CHECK_ORIGIN||'http://127.0.0.1:3001'
async function checkHttp(url){
  try{
    let response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(20000)})
    if([403,405,429,999].includes(response.status))response=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(20000)})
    const result={url,status:response.status,finalUrl:response.url,type:response.headers.get('content-type')};await response.body?.cancel();return result
  }catch(error){return {url,error:error.message}}
}
const pages=[]
const offline=process.argv.includes('--offline')
for(const route of routes){
  if(route!=='/home-classic/')try{await fs.access(path.join(root,'dist',route,'index.html'))}catch{issues.push({type:'missing-built-route',url:route})}
  if(offline)continue
  const result=await checkHttp(base+route);pages.push(result)
  if(result.error||result.status>=400)issues.push({type:'route-http',...result})
}
const links=[]
if(process.argv.includes('--external')&&!offline){
  const queue=[...external]
  await Promise.all(Array.from({length:5},async()=>{while(queue.length){const url=queue.shift();links.push(await checkHttp(url))}}))
  for(const result of links)if(result.status===404||result.status===410)issues.push({type:'broken-external',...result})
}
const report={assetsChecked:assets.size,demoReferencesChecked:demoReferences,routes:pages,external:links,issues}
const reportArg=process.argv.indexOf('--report')
if(reportArg>=0)await fs.writeFile(process.argv[reportArg+1],JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(issues.length)process.exitCode=1
