import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { portrait, portraitTextureCrop } from '../src/data/portrait.js'

test('the shared portrait is a full-resolution transparent PNG, not the old composite', async () => {
  const png = await readFile(new URL(`../public${portrait.src}`, import.meta.url))
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), portrait.width)
  assert.equal(png.readUInt32BE(20), portrait.height)
  assert.equal(png[25], 6, 'Original RGBA transparency must be preserved')
})

test('portrait crop keeps the top and centre without stretching or wrapping', () => {
  for (const [width, height] of [[4, 5], [5, 5.3], [1.64, 2.2]]) {
    const crop = portraitTextureCrop(width, height)
    assert.ok(crop.repeatX > 0 && crop.repeatX <= 1)
    assert.ok(crop.repeatY > 0 && crop.repeatY <= 1)
    assert.ok(Math.abs(crop.offsetY + crop.repeatY - 1) < 1e-10)
    assert.equal(crop.offsetX, (1 - crop.repeatX) / 2)
    assert.ok(Math.abs((portrait.width * crop.repeatX) / (portrait.height * crop.repeatY) - width / height) < 1e-10)
  }
})
