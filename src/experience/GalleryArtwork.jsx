import { useEffect, useMemo, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Fastener, PALETTE as C, PictureLight, Plate, Profile, Registration } from './GalleryFabrication.jsx'
import { Dovetail, Inlay, Loom } from './AuthoredForms.jsx'

function Brief() {
  return <>
    {/* Three expressive traces are captured by one precise registration edge. */}
    <Profile outline={[[-1.15,-.70],[.64,-.70],[1.12,-.22],[1.12,.72],[-.78,.72],[-1.15,.37]]} depth={.065} color={C.paper}/>
    <Profile outline={[[.64,-.70],[.64,-.22],[1.12,-.22]]} depth={.075} color={C.wood}/>
    {[0,1,2].map(i=><Inlay key={i} points={[[-.97,.34-i*.30],[-.61,.53-i*.23],[-.18,.15-i*.21],[.32,.36-i*.24],[.96,.36-i*.24]]} width={i===1?.067:.025} color={i===1?C.blue:C.brass} position={[0,0,.079]}/>)}
    <Plate w={.075} h={1.23} depth={.13} color={C.ink} position={[.99,.04,-.025]}/>
    <Fastener position={[-.98,.46,-.025]} length={.115}/>
  </>
}

function Hierarchy() {
  return <>
    <Loom/>
    <Plate w={.94} h={.06} depth={.11} color={C.wood} position={[-.53,-.74,-.012]}/>
    <Plate w={.14} h={.20} depth={.11} color={C.brass} position={[1.16,-.50,-.012]}/>
  </>
}

function Responsive({animate}) {
  return <>
    {/* One cut surface steps through three widths; the trace keeps its identity. */}
    <Profile outline={[[-1.3,-.58],[1.26,-.58],[1.26,.22],[.65,.22],[.65,.54],[-.12,.54],[-.12,.83],[-1.3,.83]]}
      holes={[[[-1.13,-.35],[-.32,-.35],[-.32,.60],[-1.13,.60]],[[-.13,-.35],[.44,-.35],[.44,.33],[-.13,.33]],[[.65,-.35],[1.07,-.35],[1.07,.03],[.65,.03]]]}
      depth={.11} color={C.ink}/>
    <Registration offset={[.10,0,0]} animate={animate}>
      <Inlay points={[[-1.16,.27],[-.71,.27],[-.25,.02],[.24,.02],[.64,-.18],[1.10,-.18]]} width={.15} depth={.045} color={C.blue} position={[0,0,.05]}/>
    </Registration>
    <Plate w={2.64} h={.055} depth={.17} color={C.brass} position={[0,-.63,-.018]}/>
    {[-1.18,1.14].map(x=><Fastener key={x} position={[x,-.63,-.025]} length={.20}/>)}
  </>
}

function States({animate}) {
  return <>
    {/* A guided focus shutter registers around a fixed active surface. */}
    <Profile outline={[[-1.06,-.64],[.69,-.64],[1.06,-.28],[1.06,.64],[-.69,.64],[-1.06,.28]]}
      holes={[[[-.79,-.36],[.77,-.36],[.77,.36],[-.79,.36]]]} color={C.wood} depth={.14}/>
    <Plate w={1.83} h={.026} depth={.05} color={C.brass} position={[0,.47,.15]}/>
    <Registration offset={[.22,0,0]} animate={animate}>
      <Profile outline={[[-.46,-.43],[.33,-.43],[.53,-.23],[.53,.43],[-.26,.43],[-.46,.23]]}
        holes={[[[-.32,-.27],[.20,-.27],[.39,-.08],[.39,.27],[-.13,.27],[-.32,.08]]]}
        depth={.075} color={C.blue} position={[0,0,.075]}/>
      <Plate w={.13} h={.13} depth={.035} color={C.brass} position={[.07,.47,.17]}/>
    </Registration>
    <Profile outline={[[-.13,-.18],[.12,-.18],[.29,0],[.12,.18],[-.13,.18],[-.30,0]]} depth={.08} color={C.paper} position={[0,0,.005]}/>
    <Fastener position={[0,0,-.025]} length={.115}/>
  </>
}

function Handoff({animate}) {
  return <>
    <Plate w={2.38} h={.07} depth={.10} color={C.brass} position={[0,-.70,-.02]}/>
    <Registration offset={[.09,0,0]} animate={animate}><Dovetail/></Registration>
    <Plate w={2.38} h={.07} depth={.10} color={C.brass} position={[0,.70,-.02]}/>
    {[-1.14,1.14].map(x=><Fastener key={x} position={[x,-.70,-.025]} length={.13}/>)}
  </>
}

function Surface({animate}) {
  return <>
    <Profile outline={[[-1.04,-.74],[.49,-.74],[1.04,-.18],[1.04,.74],[-.49,.74],[-1.04,.18]]} depth={.07} color={C.brass} metalness={.5}/>
    <Registration offset={[0,0,.065]} animate={animate}>
      <Profile outline={[[-.99,-.69],[.46,-.69],[.99,-.16],[.99,.69],[-.46,.69],[-.99,.16]]}
        holes={[[[-.73,-.40],[.21,-.40],[.73,.11],[.73,.41],[-.21,.41],[-.73,-.11]]]}
        depth={.06} color={C.paper} position={[0,0,.115]}/>
      <Inlay points={[[-.73,-.28],[-.38,-.28],[.08,.04],[.42,.27],[.72,.27]]} width={.23} depth={.065} color={C.blue} position={[0,0,.045]}/>
    </Registration>
    {[-.86,.86].map(x=><Fastener key={x} position={[x,0,-.025]} length={.20}/>)}
  </>
}

const installations={brief:Brief,hierarchy:Hierarchy,responsive:Responsive,states:States,handoff:Handoff,surface:Surface}
export function GalleryArtwork({side='left',z,kind,animate=true}) {
  const Art=installations[kind], sign=side==='right'?1:-1
  return <group name={`art-${kind}`} position={[sign*3.385,1.93,z]} rotation={[0,sign===-1?Math.PI/2:-Math.PI/2,0]}>
    {side==='right'&&<PictureLight/>}<Art animate={animate}/>
  </group>
}

function trackedText(ctx, text, x, y, tracking) {
  let cursor = x
  for (const character of text) {
    ctx.fillText(character, cursor, y)
    cursor += ctx.measureText(character).width + tracking
  }
}

function EndWallTypography() {
  const [fontRevision, setFontRevision] = useState(0)

  useEffect(() => {
    if (!document.fonts) return undefined
    let active = true
    Promise.all([
      document.fonts.load('700 250px Manrope'),
      document.fonts.load('500 48px "DM Mono"'),
    ]).then(() => {
      if (active) setFontRevision(1)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1536
    const ctx = canvas.getContext('2d')

    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#69717a'
    ctx.font = '500 52px "DM Mono", monospace'
    trackedText(ctx, 'THE INTERFACE GALLERY', 112, 238, 11)

    ctx.fillStyle = C.ink
    ctx.font = '700 250px Manrope, system-ui, sans-serif'
    trackedText(ctx, 'Usman Khair Din', 102, 520, -9)

    ctx.fillStyle = C.blue
    ctx.font = '600 72px "DM Mono", monospace'
    trackedText(ctx, 'BRIEF → SYSTEM → SURFACE', 112, 700, 5)

    ctx.fillStyle = C.brass
    ctx.fillRect(112, 775, 1660, 6)

    ctx.fillStyle = '#2e3742'
    ctx.font = '500 94px Manrope, system-ui, sans-serif'
    ctx.fillText('brief@usmankhairdin.com', 112, 916)

    ctx.fillStyle = '#464d55'
    ctx.font = '500 74px Manrope, system-ui, sans-serif'
    ctx.fillText('This experience was designed and built', 112, 1045)
    ctx.fillText('by Usman Khair Din.', 112, 1143)

    ctx.fillStyle = '#565e67'
    ctx.font = '500 58px "DM Mono", monospace'
    trackedText(ctx, 'BUILT WITH REACT · THREE.JS · GSAP', 112, 1320, 5)

    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    return map
  }, [fontRevision])

  useEffect(() => () => texture.dispose(), [texture])

  return <mesh position={[-1.02, 1.825, .024]}>
    <planeGeometry args={[3.12, 2.12]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>
}

export function EndWallArtwork({z=-93.885}) {
  const portrait = useTexture('/assets/profile-corridor.png')
  const portraitFade = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const fade = ctx.createLinearGradient(0, canvas.height, 0, 0)
    fade.addColorStop(0, '#000000')
    fade.addColorStop(.07, '#4a4a4a')
    fade.addColorStop(.18, '#ffffff')
    fade.addColorStop(1, '#ffffff')
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const map = new THREE.CanvasTexture(canvas)
    map.minFilter = THREE.LinearFilter
    map.magFilter = THREE.LinearFilter
    return map
  }, [])

  useEffect(() => {
    portrait.colorSpace = THREE.SRGBColorSpace
    portrait.anisotropy = 8
    portrait.wrapS = THREE.ClampToEdgeWrapping
    portrait.wrapT = THREE.ClampToEdgeWrapping
    portrait.repeat.set(1, .88)
    portrait.offset.set(0, .12)
    portrait.needsUpdate = true
  }, [portrait])

  useEffect(() => () => portraitFade.dispose(), [portraitFade])

  return <group name="art-usman-khair-din-destination" position={[0, 0, z]}>
    {/* A narrow inlay keys the information block into the wall without turning it into a poster. */}
    <Plate w={.026} h={2.12} depth={.026} color={C.blue} position={[-2.62, 1.825, .006]} />
    <EndWallTypography />
    {/* The approved portrait is shown at its native aspect ratio; its painted lower edge stays intact. */}
    <mesh position={[1.72, 1.61, .032]}>
      <planeGeometry args={[2.84, 3.12]} />
      <meshBasicMaterial
        map={portrait}
        alphaMap={portraitFade}
        transparent
        alphaTest={.012}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  </group>
}

export function FloorSculpture({position,kind='gauge'}) {
  return <group name={`art-floor-${kind}`} position={position}>
    <Plate w={1.0} h={.80} depth={.15} color={C.wood} rotation={[-Math.PI/2,0,0]}/>
    {kind==='gauge'?<>
      <Inlay points={[[-.32,0],[-.32,.40],[.30,.86],[.30,1.43]]} width={.19} depth={.30} color={C.ivory} position={[0,.15,-.15]}/>
      <Inlay points={[[.32,0],[.32,.40],[-.30,.86],[-.30,1.43]]} width={.10} depth={.16} color={C.blue} position={[0,.15,-.08]}/>
      <Plate w={.72} h={.06} depth={.36} color={C.brass} position={[0,.20,-.18]}/>
    </>:<>
      <Profile outline={[[-.35,0],[-.35,1.35],[-.08,1.35],[-.08,.89],[.15,.97],[.15,.49],[-.08,.57],[-.08,0]]} depth={.30} color={C.wood} position={[0,.15,-.15]}/>
      <Profile outline={[[.36,0],[.36,1.35],[-.04,1.35],[-.04,.94],[.19,1.02],[.19,.44],[-.04,.52],[-.04,0]]} depth={.30} color={C.blue} position={[0,.15,-.15]}/>
      <Plate w={.74} h={.055} depth={.34} color={C.brass} position={[0,1.53,-.17]}/>
    </>}
  </group>
}
