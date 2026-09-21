import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import useReducedMotion from './useReducedMotion.js'
import { useSurface } from './surfaces.js'

export const PALETTE = { blue: '#455dff', ink: '#202936', brass: '#ad8755', ivory: '#e9dfd0', wood: '#68503c', paper: '#f5eddf' }
export const rectangle = (w, h) => [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]
const FabricationContext = createContext(null)
export function FabricationProvider({ children }) {
  const grain = useSurface('joinery', .7, .7, 152)
  return <FabricationContext.Provider value={grain}>{children}</FabricationContext.Provider>
}

// Solid, beveled CNC profiles. Cutouts are actual holes, not painted silhouettes.
export function Profile({ outline, holes = [], depth = .065, bevel = .009, color = PALETTE.ivory, position, rotation, metalness = .08, roughness = .51, smoothEdges = false }) {
  const grain = useContext(FabricationContext)
  const isWood = color === PALETTE.wood && grain
  const shapeKey = JSON.stringify([outline, holes])
  const geometry = useMemo(() => {
    const [contour, apertures] = JSON.parse(shapeKey)
    const shape = new THREE.Shape(contour.map(([x,y]) => new THREE.Vector2(x,y)))
    apertures.forEach(points => shape.holes.push(new THREE.Path(points.map(([x,y]) => new THREE.Vector2(x,y)))))
    const solid = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: bevel > 0, bevelSegments: 2, bevelSize: bevel, bevelThickness: bevel, curveSegments: 8 })
    // Smooth only shallow changes along curved cut edges; keep hard face joins crisp.
    return smoothEdges ? toCreasedNormals(solid, .35) : solid
  }, [shapeKey, depth, bevel, smoothEdges])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} position={position} rotation={rotation}>
    <meshStandardMaterial color={isWood?'#c4b29a':color} map={isWood?grain:null} bumpMap={isWood?grain:null} bumpScale={.002} metalness={isWood?0:metalness} roughness={isWood?.62:roughness} />
  </mesh>
}
export function Plate({ w, h, depth = .05, ...props }) { return <Profile outline={rectangle(w,h)} depth={depth} {...props} /> }
export function Frame({ w, h, rim = .065, ...props }) { return <Profile outline={rectangle(w,h)} holes={[rectangle(w-rim*2,h-rim*2)]} {...props} /> }

// Real standoff shaft and correctly oriented, slotted head. Back meets wall.
export function Fastener({ position = [0,0,0], length = .10 }) {
  return <group position={position}>
    <mesh position={[0,0,length/2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.012,.012,length,8]}/><meshStandardMaterial color={PALETTE.brass} metalness={.68} roughness={.32}/></mesh>
    <mesh position={[0,0,length]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.026,.026,.016,12]}/><meshStandardMaterial color={PALETTE.brass} metalness={.68} roughness={.32}/></mesh>
    <mesh position={[0,0,length+.009]}><boxGeometry args={[.026,.004,.001]}/><meshStandardMaterial color={PALETTE.ink}/></mesh>
  </group>
}

// Nearby picture lights add a restrained material highlight without casting shadows.
export function PictureLight({ power = 5 }) {
  const root = useRef(), light = useRef(), target = useRef()
  const world = useMemo(()=>new THREE.Vector3(),[])
  useEffect(()=>{if(light.current) light.current.target=target.current},[])
  useFrame(({camera})=>{
    if(!root.current || !light.current) return
    root.current.getWorldPosition(world)
    const amount=THREE.MathUtils.clamp((18-world.distanceTo(camera.position))/5,0,1)
    light.current.intensity=power*amount*amount*(3-2*amount)
  })
  return <group ref={root}>
    <Plate w={.35} h={.07} depth={.55} position={[0,1.07,-.015]} color={PALETTE.brass}/>
    <mesh position={[0,1.025,.46]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[.27,.12]}/><meshBasicMaterial color="#fff0d2"/></mesh>
    <object3D ref={target} position={[0,-.15,.02]}/>
    <spotLight ref={light} position={[0,1.02,.52]} intensity={power} distance={4} angle={1.05} penumbra={.65} decay={2} color="#ffe9c7" />
  </group>
}

// Texture and physical plane use the same aspect ratio; type is fitted, never stretched.
export function ArtLabel({ text, width = 1.7, height = .11, position = [0,-.88,.018], color = '#575149', align = 'center' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1536
    canvas.height = Math.max(32, Math.round(canvas.width * height / width))
    const ctx = canvas.getContext('2d')
    let size = canvas.height * .58
    ctx.font = `500 ${size}px Arial, sans-serif`
    size *= Math.min(1, canvas.width * .95 / ctx.measureText(text).width)
    ctx.font = `500 ${size}px Arial, sans-serif`
    ctx.textAlign = align
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(text, align === 'left' ? 4 : canvas.width/2, canvas.height/2)
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    return map
  }, [text, width, height, color, align])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position}><planeGeometry args={[width,height]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/></mesh>
}

const smooth = t => t*t*t*(t*(t*6-15)+10)
// One approach-triggered registration. Rigid translation along each work's guide bed.
export function Registration({ children, offset = [.14,0,0], position = [0,0,0], animate = true, delay = 0, near = 9 }) {
  const root = useRef()
  const part = useRef()
  const elapsed = useRef(-1)
  const world = useMemo(() => new THREE.Vector3(), [])
  const reduced = useReducedMotion()
  useFrame(({camera},dt) => {
    if (!root.current || !part.current) return
    if (reduced) { part.current.position.set(0,0,0); elapsed.current = 3; return }
    if (elapsed.current >= 3) { part.current.position.set(0,0,0); return }
    if (!animate) return
    if (elapsed.current < 0) {
      root.current.getWorldPosition(world)
      if (world.distanceTo(camera.position) > near) return
      elapsed.current = 0
    }
    elapsed.current = Math.min(3, elapsed.current + Math.min(dt,.05))
    const t = THREE.MathUtils.clamp((elapsed.current-delay)/1.65,0,1)
    // Release preload, register, tiny compliant overtravel, exact settle.
    let remaining
    if(t < .16) remaining = 1 + .08*smooth(t/.16)
    else if(t < .82) remaining = 1.08 - 1.105*smooth((t-.16)/.66)
    else remaining = -.025*(1-smooth((t-.82)/.18))
    part.current.position.set(offset[0]*remaining,offset[1]*remaining,offset[2]*remaining)
  })
  return <group ref={root} position={position}><group ref={part} position={reduced ? [0,0,0] : offset}>{children}</group></group>
}
