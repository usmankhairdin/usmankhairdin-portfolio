import assert from 'node:assert/strict'
import { test } from 'node:test'
import { centerHotspot } from '../src/experience/centerHotspot.js'

test('the exterior action belongs to the centre dot rather than a hidden cursor over another hotspot', () => {
  const door = { element: 'door', rect: { left: 100, right: 300, top: 200, bottom: 700, width: 200, height: 500 } }
  const sign = { element: 'sign', rect: { left: 550, right: 650, top: 300, bottom: 500, width: 100, height: 200 } }
  assert.equal(centerHotspot([door, sign], 1200, 800), 'sign')
  assert.equal(centerHotspot([door], 1200, 800), null)
  assert.equal(centerHotspot([{ ...sign, rect: { ...sign.rect, width: 0 } }], 1200, 800), null)
})
