import assert from 'node:assert/strict'
import {test} from 'node:test'
import {settlementDensity,settlementCells,SETTLEMENT_GLSL} from '../src/rooms/settlementPlan.js'

test('generated district rotations never emit a GLSL decrement token before a numeric coefficient',()=>{
  assert.equal(/--\s*\d/.test(SETTLEMENT_GLSL),false,'negative district angles must be grouped when negated for the inverse rotation')
})

test('inhabited district arms have deep woodland notches between their unequal branches',()=>{
  for(const [x,z]of [[-500,150],[420,-180],[330,580]])assert.ok(settlementDensity(x,z)>.3,`a real residential arm reaches ${x},${z}`)
  for(const [x,z]of [[430,180],[-180,360],[30,-490]])assert.ok(settlementDensity(x,z)<.22,`woodland penetrates between the arms at ${x},${z}`)
  assert.ok(settlementDensity(80,-80)>.8,'the compact mixed centre remains inhabited')
})

test('the settlement silhouette has unequal sector reaches instead of an ellipse or uniform ring',()=>{
  const reaches=[]
  for(let i=0;i<24;i++){
    const angle=i*Math.PI/12
    let reach=0
    for(let r=0;r<=1050;r+=10)if(settlementDensity(80+Math.cos(angle)*r,-80+Math.sin(angle)*r)>.26)reach=r
    reaches.push(reach)
  }
  assert.ok(Math.max(...reaches)-Math.min(...reaches)>350,'district fingers and forest inlets differ by several blocks in depth')
  assert.ok(reaches.some(r=>r<360)&&reaches.some(r=>r>750),'a short green-facing edge coexists with a long inhabited branch')
})

test('the retained inhabited cells follow the branches while leaving the inter-arm forests unbuilt',()=>{
  const cells=[...settlementCells().values()]
  assert.ok(cells.length>110,'irregular massing retains enough land for complete neighborhoods')
  for(const [x,z]of [[-500,150],[420,-180],[330,580]])assert.ok(cells.filter(c=>Math.hypot(c.x-x,c.z-z)<160).length>=4,'each main arm retains several occupied street blocks')
  for(const [x,z]of [[430,180],[-180,360]])assert.ok(cells.filter(c=>Math.hypot(c.x-x,c.z-z)<90).length<=1,'a forest notch is visible in the actual cell plan')
})
