import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {projects,workProjects,nextCaseStudy} from '../src/data/projects.js'
import {workRoomProjects} from '../src/rooms/workRoomProjects.js'
import {CASE_STUDIES} from '../src/data/projectCaseStudies.js'
import {PROJECT_BRANDS} from '../src/data/projectBrands.js'
import {seoForPath,seoPaths} from '../src/seo/routeSeo.js'

test('Web owns eight templates and the fixed Corridor selection owns exactly six complete demos',()=>{
 const slugs=['forme','meridian','nexora','carthevia','forma','avenlo','veyravael','sanaira']
 assert.deepEqual(workProjects.map(p=>p.slug),slugs)
 assert.deepEqual(new Set(projects.map(p=>p.slug)),new Set(slugs))
 assert.deepEqual(workRoomProjects.map(p=>p.slug),slugs.slice(0,6))
 for(const p of workProjects){
  assert.equal(p.liveUrl,'https://www.usmankhairdin.com/portfolio/'+p.slug+'/')
  assert.ok(fs.existsSync('public/portfolio/'+p.slug+'/index.html'),p.slug)
  assert.ok(CASE_STUDIES[p.slug].chapters.length>=2,p.slug)
  assert.ok(PROJECT_BRANDS[p.slug].light&&PROJECT_BRANDS[p.slug].dark,p.slug)
 }
 assert.equal(nextCaseStudy('/work/forme/').href,'/work/meridian/')
 assert.equal(nextCaseStudy('/work/sanaira/').href,'/work/personal-portfolio-3d/')
 for(const slug of ['prima','rantle','bum-life','basecare']){
  assert.equal(seoForPath('/work/'+slug+'/'),null)
  assert.ok(!seoPaths.includes('/work/'+slug+'/'))
 }
})

test('FORME presentation evidence, section captures and portable entry assets resolve',()=>{
 const p=projects.find(p=>p.slug==='forme')
 const assets=new Set(Object.values(p.media).flat().filter(v=>typeof v==='string'&&v.startsWith('/assets/')))
 const visit=node=>{if(!node||typeof node!=='object')return;if(node.src)assets.add(node.src);if(node.srcSet)node.srcSet.split(',').forEach(v=>assets.add(v.trim().split(' ')[0]));Object.values(node).forEach(visit)}
 visit(CASE_STUDIES.forme)
 assets.add(new URL(seoForPath('/work/forme/').image).pathname)
 for(const path of assets)assert.ok(fs.existsSync('public'+path.split('?')[0]),path)
 const html=fs.readFileSync('public/portfolio/forme/index.html','utf8')
 for(const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync('public/portfolio/forme/'+match[1]),match[1])
 assert.ok(fs.readFileSync('public/sitemap.xml','utf8').includes('/work/forme/'))
})

test('Retired client showcases are absent from primary page examples and their old routes redirect',()=>{
 for(const file of ['src/pages/HomeWeb.jsx','src/pages/Services.jsx','src/pages/DesignSystem.jsx','src/data/projects.js','src/data/projectCaseStudies.js'])
  assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\bPRIMA\b|\bRantle\b|Bum[ .-]?Life|Basecare/i,file)
 const rules=fs.readFileSync('public/.htaccess','utf8')
 assert.ok(rules.indexOf('RewriteRule ^work/')<rules.indexOf('RewriteCond %{REQUEST_FILENAME} -f'))
 assert.match(rules,/RewriteRule \^portfolio\//)
})
