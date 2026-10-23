import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {projects} from '../src/data/projects.js'
import {workRoomProjects} from '../src/rooms/workRoomProjects.js'
import {CASE_STUDIES} from '../src/data/projectCaseStudies.js'
import {seoForPath} from '../src/seo/routeSeo.js'

test('Avenlo is a complete Work item and joins the six latest immersive exhibits',()=>{
 const p=projects.find(x=>x.slug==='avenlo')
 assert.ok(p)
 assert.equal(p.liveUrl,'https://www.usmankhairdin.com/portfolio/avenlo/')
 assert.deepEqual(workRoomProjects.map(x=>x.slug),['forme','meridian','nexora','carthevia','forma','avenlo'])
 assert.ok(CASE_STUDIES.avenlo.chapters.length)
 assert.match(seoForPath('/work/avenlo/').title,/Avenlo/)
 assert.ok(fs.existsSync('public/portfolio/avenlo/index.html'))
 assert.ok(fs.existsSync('public/portfolio/avenlo/for-brokers/index.html'))
 assert.ok(fs.existsSync('public/portfolio/avenlo/for-employers/index.html'))
 for(const file of ['showcase.webp','showcase-1x.webp','hero.webp','detail.webp','fullpage.webp'])assert.ok(fs.existsSync('public/assets/projects/avenlo/'+file))
})
