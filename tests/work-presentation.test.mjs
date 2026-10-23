import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {projects, workProjects, nextCaseStudy} from '../src/data/projects.js'
import {workRoomProjects} from '../src/rooms/workRoomProjects.js'
import {CASE_STUDIES} from '../src/data/projectCaseStudies.js'
import {seoForPath} from '../src/seo/routeSeo.js'

test('Work follows the owner sequence without adding bays to the immersive room',()=>{
 assert.deepEqual(workProjects.map(p=>p.slug),['forme','meridian','nexora','carthevia','forma','avenlo','veyravael','sanaira'])
 assert.deepEqual(workRoomProjects.map(p=>p.slug),['forme','meridian','nexora','carthevia','forma','avenlo'])
 for(let i=0;i<workProjects.length-1;i++)assert.equal(nextCaseStudy(`/work/${workProjects[i].slug}/`).href,`/work/${workProjects[i+1].slug}/`)
})
test('Carthevia has a complete local case-study and portable website',()=>{
 assert.ok(CASE_STUDIES.carthevia.chapters.length>=2)
 assert.match(seoForPath('/work/carthevia/').title,/Carthevia/)
 for(const name of ['hero.webp','fullpage.webp','showcase.webp','showcase-1x.webp','detail.webp'])assert.ok(fs.existsSync(`public/assets/projects/carthevia/${name}`))
 for(const page of ['index.html','platform/storefronts/index.html','platform/checkout/index.html'])assert.ok(fs.existsSync(`public/portfolio/carthevia/${page}`),page)
})
