import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {literalDemoDependencies} from '../scripts/demo-dependencies.mjs'

test('compiled Nexora runtime HTML expressions are not literal dependency URLs',()=>{
 const folder='public/portfolio/nexora/assets'
 const bundle=fs.readdirSync(folder).find(name=>/^index-.+\.js$/.test(name))
 const urls=[...literalDemoDependencies(fs.readFileSync(`${folder}/${bundle}`,'utf8'),{javascript:true})]
 assert.ok(!urls.includes('`+i+`'))
 assert.ok(!urls.includes('`+L(e)+`'))
})

test('literal dependency URLs remain checkable even when their files are missing',()=>{
 const html='<img src="./missing-real.webp"><link href="./assets/site.css"><div style="background:url(./missing-background.png)"></div>'
 assert.deepEqual([...literalDemoDependencies(html)],['./missing-real.webp','./assets/site.css','./missing-background.png'])
 assert.deepEqual([...literalDemoDependencies('node.innerHTML=\'<img src="./missing-real.webp">\'',{javascript:true})],['./missing-real.webp'])
})