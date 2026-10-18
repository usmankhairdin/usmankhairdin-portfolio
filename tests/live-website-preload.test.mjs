import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createWebsiteReadiness} from '../src/rooms/liveScreenReadiness.js'
const preload=await import('../src/rooms/liveWebsitePreload.js').catch(()=>({}))

function fixture(){
 const requests=[],pending=[],timers=new Map()
 class Node extends EventTarget{
  constructor(tag){super();this.tagName=tag;this.style={};this.dataset={};this.children=[];this.srcWrites=0}
  set src(value){this.url=value;this.srcWrites++} get src(){return this.url}
  setAttribute(){} append(el){el.parent=this;this.children.push(el)} remove(){this.parent.children=this.parent.children.filter(v=>v!==this);this.parent=null}
 }
 const root=new Node('div'),document={createElement:tag=>new Node(tag)}
 const platform={fetch:(url,{signal})=>{requests.push({url,signal});return new Promise(resolve=>pending.push(resolve))},requestAnimationFrame:fn=>{fn();return 1},cancelAnimationFrame(){},setTimeout:fn=>{const id=timers.size+1;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id)}
 const projects=[{slug:'a',title:'First',embedUrl:'https://a.example/'},{slug:'b',title:'Second',embedUrl:'https://b.example/'}]
 return {root,document,platform,projects,requests,pending,timers}
}
test('all live websites begin loading before any scene mesh or shader is ready',async()=>{
 assert.equal(typeof preload.prepareLiveWebsites,'function')
 const f=fixture(),ready=createWebsiteReadiness(['a','b'])
 const prepared=preload.prepareLiveWebsites(f.projects,f.root,ready,{document:f.document,platform:f.platform})
 assert.equal(f.requests.length,2);assert.equal(f.root.children.length,2);assert.equal(ready.complete,false)
 for(const entry of prepared.entries.values())entry.frame.dispatchEvent(new Event('load'))
 f.pending.forEach(resolve=>resolve({type:'opaque'}));await Promise.resolve();await Promise.resolve()
 assert.equal(ready.complete,true);assert.ok([...prepared.entries.values()].every(e=>e.loaded&&e.frame.srcWrites===1))
 prepared.dispose()
})
test('preloaded iframe identity and document survive scene attachment and remount',()=>{
 assert.equal(typeof preload.attachPreparedWebsite,'function')
 const f=fixture(),prepared=preload.prepareLiveWebsites(f.projects,f.root,createWebsiteReadiness(['a','b']),{document:f.document,platform:f.platform})
 const website=prepared.entries.get('a'),parent=website.element.parent,entry={}
 preload.attachPreparedWebsite(entry,website);const frame=entry.frame
 entry.dispose();preload.attachPreparedWebsite(entry,website)
 assert.equal(entry.frame,frame);assert.equal(website.element.parent,parent);assert.equal(frame.srcWrites,1)
 prepared.dispose()
})
test('disposing the experience cancels pending preloads and removes only its own frames',()=>{
 assert.equal(typeof preload.prepareLiveWebsites,'function')
 const f=fixture(),prepared=preload.prepareLiveWebsites(f.projects,f.root,createWebsiteReadiness(['a','b']),{document:f.document,platform:f.platform})
 prepared.dispose()
 assert.equal(f.root.children.length,0);assert.equal(f.timers.size,0);assert.ok(f.requests.every(r=>r.signal.aborted))
})
