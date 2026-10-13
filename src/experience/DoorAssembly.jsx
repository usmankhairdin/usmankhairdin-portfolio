import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { doorSystem } from './doorSystem.js'

/*
 * THE door of the building. Every room door and the entrance (the same door the Home page
 * shows) are this one assembly: a dark-bronze portal with slim brass edge lines, and in it an
 * automatic glass door - two clear panels that part from the middle and slide into pockets in
 * the wall, like the doors of a good building. Each panel has fine brass edges; a frosted band
 * at eye height carries the room's name, cut clear through the frosting, so it reads from the
 * corridor and keeps a person from walking into closed glass. A small sensor light in the head
 * brightens as the door opens.
 *
 * Door-local frame (unchanged): x across the opening, +z toward the side the door is
 * approached from, the assembly's origin 1.45 m below the frame's centre, and z = 0 the
 * middle of the wall the door stands in - so the open panels disappear inside it.
 */
const F = doorSystem.frame
const JAMB_X = 0.98                     // jamb centre: its inner face is the opening edge
const FRAME_Z = -0.07
const FRONT = FRAME_Z + F.depth / 2     // the portal's approach-side face
const CLEAR = 0.86                      // half the clear opening
const GLASS = { w: CLEAR + 0.02, h: 2.84, t: 0.012, y: -1.45 + 0.01 + 2.84 / 2, z: -0.02, edge: 0.022 }
const BAND = { y: 1.38 - 1.45, h: 0.15 }   // the frosted band, at eye height (assembly-local)

function bandTexture(label) {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 180
  const g = c.getContext('2d')
  g.fillStyle = 'rgba(255,255,255,1)'
  g.fillRect(0, 0, c.width, c.height)
  // the name, cut clear out of the frosting
  g.globalCompositeOperation = 'destination-out'
  g.font = '700 74px Manrope, system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const text = String(label || '').split('').join(String.fromCharCode(8202))
  g.fillText(text, c.width / 2, c.height / 2 + 3)
  g.fillRect(0, 22, c.width, 3)
  g.fillRect(0, c.height - 25, c.width, 3)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

const none = () => null

function GlassPanel({ side, mats, band, panelRef }) {
  const geometry = useMemo(() => ({
    glass: new THREE.BoxGeometry(GLASS.w, GLASS.h, GLASS.t),
    stile: new THREE.BoxGeometry(GLASS.edge, GLASS.h, GLASS.t + 0.014),
    rail: new THREE.BoxGeometry(GLASS.w, 0.05, GLASS.t + 0.014),
    band: (() => {
      const g = new THREE.PlaneGeometry(GLASS.w - GLASS.edge * 2, BAND.h)
      // each panel shows its own half of the one band, so the name reads whole when shut
      const uv = g.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setX(i, side < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5)
      uv.needsUpdate = true
      return g
    })(),
  }), [side])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])
  const inner = side < 0 ? GLASS.w / 2 - GLASS.edge / 2 : -GLASS.w / 2 + GLASS.edge / 2
  return <group ref={panelRef}>
    <mesh geometry={geometry.glass} material={mats.glass} raycast={none} renderOrder={3} />
    {[inner, -inner].map((x) => <mesh key={x} geometry={geometry.stile} material={mats.brassSatin} position={[x, 0, 0]} raycast={none} />)}
    {[-1, 1].map((s) => <mesh key={s} geometry={geometry.rail} material={mats.brassSatin} position={[0, s * (GLASS.h / 2 - 0.025), 0]} raycast={none} />)}
    {[1, -1].map((face) => <mesh
      key={face}
      geometry={geometry.band}
      material={band[face === 1 ? 'front' : 'back']}
      position={[0, BAND.y - GLASS.y, face * (GLASS.t / 2 + 0.001)]}
      rotation={[0, face === 1 ? 0 : Math.PI, 0]}
      raycast={none}
      renderOrder={4}
    />)}
  </group>
}

export default function DoorAssembly({ mats, open, label, backLabel }) {
  const geometry = useMemo(() => ({
    jamb: new THREE.BoxGeometry(F.jamb, F.height, F.depth),
    head: new THREE.BoxGeometry(F.width, F.head, F.depth),
    threshold: new THREE.BoxGeometry(F.width, 0.11, 0.72),
    edgeV: new THREE.BoxGeometry(0.02, F.height - F.head, 0.006),
    edgeH: new THREE.BoxGeometry(CLEAR * 2 + 0.04, 0.02, 0.006),
    sensor: new THREE.BoxGeometry(0.34, 0.012, 0.03),
  }), [])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])

  const band = useMemo(() => {
    const make = (text) => new THREE.MeshBasicMaterial({ map: bandTexture(text), color: '#eef2f1', transparent: true, opacity: 0.62, depthWrite: false })
    return { front: make(label), back: make(backLabel || label) }
  }, [label, backLabel])
  useEffect(() => () => Object.values(band).forEach((m) => { m.map.dispose(); m.dispose() }), [band])

  const sensorMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffe3b8' }), [])
  useEffect(() => () => sensorMat.dispose(), [sensorMat])

  const left = useRef()
  const right = useRef()
  useFrame(() => {
    const o = THREE.MathUtils.clamp(open(), 0, 1.04)
    const travel = (CLEAR + 0.02) * o
    if (left.current) left.current.position.set(-GLASS.w / 2 - travel, GLASS.y, GLASS.z)
    if (right.current) right.current.position.set(GLASS.w / 2 + travel, GLASS.y, GLASS.z)
    sensorMat.color.setRGB(1, 0.89, 0.72).multiplyScalar(0.35 + Math.min(1, o) * 1.6)
  })

  return <group position={[0, 1.45, 0]}>
    {/* Portal: dark bronze jambs and head, a brass line tracing the opening on the face. */}
    {[-1, 1].map((s) => <group key={s}>
      <mesh geometry={geometry.jamb} material={mats.doorFrame} position={[s * JAMB_X, 0, FRAME_Z]} />
      <mesh geometry={geometry.edgeV} material={mats.brassSatin} position={[s * (JAMB_X - F.jamb / 2 + 0.012), -F.head / 2, FRONT + 0.003]} />
    </group>)}
    <mesh geometry={geometry.head} material={mats.doorFrame} position={[0, 1.52, FRAME_Z]} />
    <mesh geometry={geometry.edgeH} material={mats.brassSatin} position={[0, 1.52 - F.head / 2 + 0.012, FRONT + 0.003]} />
    <mesh geometry={geometry.threshold} material={mats.brassSatin} position={[0, -1.53, -0.04]} />
    {/* the operator's sensor, under the head on both faces */}
    {[1, -1].map((face) => <mesh key={face} geometry={geometry.sensor} material={sensorMat} position={[0, 1.52 - F.head / 2 - 0.008, face * 0.2]} raycast={none} />)}

    <GlassPanel side={-1} mats={mats} band={band} panelRef={left} />
    <GlassPanel side={1} mats={mats} band={band} panelRef={right} />
  </group>
}
