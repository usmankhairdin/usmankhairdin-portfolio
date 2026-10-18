import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWebsiteReadiness, watchWebsiteLoad } from '../src/rooms/liveScreenReadiness.js'

test('boot waits for every website, including ones on the opposite wall', () => {
  const ready = createWebsiteReadiness(['forma', 'sanaira', 'prima'])
  assert.equal(ready.complete, false)
  ready.settle('forma', 'live')
  ready.settle('sanaira', 'live')
  assert.equal(ready.complete, false)
  ready.settle('prima', 'live')
  assert.equal(ready.complete, true)
})

function loadFixture() {
  const frame = new EventTarget(), paints = [], timers = new Map(), calls = []
  let resolve, reject
  const probe = new Promise((yes, no) => { resolve = yes; reject = no })
  const platform = {
    fetch: (_url, options) => { calls.push(options); return probe },
    requestAnimationFrame: fn => { paints.push(fn); return paints.length }, cancelAnimationFrame: () => {},
    setTimeout: fn => { timers.set(1, fn); return 1 }, clearTimeout: id => timers.delete(id),
  }
  let live = 0, fallback = 0
  const dispose = watchWebsiteLoad(frame, 'https://example.com/', { platform, onLive: () => live++, onFallback: () => fallback++ })
  return { frame, paints, timers, calls, resolve, reject, dispose, get live() { return live }, get fallback() { return fallback } }
}

test('an iframe load alone cannot hide the capture before network reachability and two paint frames', async () => {
  const f = loadFixture()
  f.frame.dispatchEvent(new Event('load'))
  while (f.paints.length) f.paints.shift()()
  assert.equal(f.live, 0)
  f.resolve({ type: 'opaque', status: 0, ok: false })
  await Promise.resolve(); await Promise.resolve()
  assert.equal(f.live, 1, 'opaque success is valid for a no-CORS reachability probe')
  assert.equal(f.calls[0].method, 'HEAD')
  assert.equal(f.calls[0].credentials, 'omit')
  f.dispose()
})

test('offline loads and disposed frames cannot replace a screen with an error document', async () => {
  const failed = loadFixture()
  failed.reject(new TypeError('Failed to fetch'))
  await Promise.resolve(); await Promise.resolve()
  failed.frame.dispatchEvent(new Event('load'))
  while (failed.paints.length) failed.paints.shift()()
  assert.equal(failed.live, 0)
  assert.equal(failed.fallback, 1)
  failed.dispose()
  const stale = loadFixture()
  stale.dispose(); stale.resolve({ type: 'opaque' }); stale.frame.dispatchEvent(new Event('load'))
  await Promise.resolve(); await Promise.resolve()
  assert.equal(stale.live, 0)
  assert.equal(stale.calls[0].signal.aborted, true)
})

test('a failed external website completes boot with its capture fallback instead of a blank display', () => {
  const ready = createWebsiteReadiness(['forma', 'prima'])
  ready.settle('forma', 'live')
  ready.settle('prima', 'fallback')
  assert.equal(ready.complete, true)
  assert.equal(ready.status('prima'), 'fallback')
  ready.settle('prima', 'live')
  assert.equal(ready.status('prima'), 'live', 'a late successful load can replace the fallback')
  ready.settle('unknown', 'live')
  assert.equal(ready.status('unknown'), undefined)
})
