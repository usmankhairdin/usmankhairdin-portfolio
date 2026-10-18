import * as THREE from 'three'
import { ARCHITECTURE_FAMILIES, buildingDistanceSquared, buildingPlanBounds, planRealBuilding, planRealRound, planStructuralCore, realBuildingEligible, realRoundEligible } from './realCityBuildingPlan.js'

// Source walls remain at walking distance. Distant lots use a closed shell with
// the same family palette, storeys and window rhythm instead of thousands of
// repeated kit pieces. This cap applies to submitted near triangles citywide.
export const NEAR_TRIANGLE_BUDGET = 700000
export const architectureRetentionDistance = nearDistance => nearDistance + 24

export function createArchitectureVisibility(buildings, triangleCosts, budget = NEAR_TRIANGLE_BUDGET) {
  const state = new Uint8Array(buildings.length), changed = new Uint8Array(buildings.length)
  const previous = new Uint8Array(buildings.length), distances = new Float64Array(buildings.length)
  const resident = new Uint8Array(buildings.length), priorities = new Float64Array(buildings.length)
  const candidates = [], compareDistance = (a, b) => priorities[a] - priorities[b] || a - b
  const bounds = buildings.map(b => {
    const p = buildingPlanBounds(b,1.5)
    return new THREE.Box3(new THREE.Vector3(p.minX,b.y-.5,p.minZ),new THREE.Vector3(p.maxX,b.y+b.h+1.5,p.maxZ))
  })
  const frustum = new THREE.Frustum(), matrix = new THREE.Matrix4(), last = new THREE.Matrix4()
  const inverseRoot = new THREE.Matrix4(), eye = new THREE.Vector3()
  let initialized = false, lastNearDistance
  return { state, changed, update(camera, rootMatrix, nearDistance) {
    // Include the entire view transform: turning, projection changes and parent
    // transforms all invalidate culling even when the camera position is fixed.
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(rootMatrix)
    if (initialized && last.equals(matrix) && lastNearDistance === nearDistance) return false
    last.copy(matrix)
    lastNearDistance = nearDistance
    frustum.setFromProjectionMatrix(matrix)
    eye.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(inverseRoot.copy(rootMatrix).invert())
    previous.set(state)
    candidates.length = 0
    for (let i = 0; i < buildings.length; i++) {
      state[i] = frustum.intersectsBox(bounds[i]) ? 2 : 0
      distances[i] = Math.sqrt(buildingDistanceSquared(buildings[i], eye))
      const radius = resident[i] ? architectureRetentionDistance(nearDistance) : nearDistance - (initialized ? 8 : 0)
      priorities[i] = distances[i] - (resident[i] ? 12 : 0)
      if (distances[i] < radius) candidates.push(i)
    }
    // Residency is independent of view direction. A neighbor leaving the
    // frustum must not change the windows on a building still in view. Existing
    // detail also gets a distance margin, preventing budget ties and walking
    // bob from repeatedly swapping entire facades.
    candidates.sort(compareDistance)
    resident.fill(0)
    let triangles = 0, anyChanged = false
    for (const i of candidates) {
      if (triangles + triangleCosts[i] > budget) continue
      resident[i] = 1
      triangles += triangleCosts[i]
    }
    for (let i = 0; i < buildings.length; i++) {
      if (state[i] && resident[i]) state[i] = 1
      changed[i] = !initialized || previous[i] !== state[i] ? 1 : 0
      anyChanged ||= !!changed[i]
    }
    initialized = true
    return anyChanged
  } }
}

function windowPatternHash(x, y, family) {
  let value = Math.imul(x + 11 + family * 17, 73856093) ^ Math.imul(y + 31, 19349663)
  value = Math.imul(value ^ value >>> 16, 2246822507)
  return ((value ^ value >>> 13) >>> 0) / 4294967296
}

export function facadeWindowLight(family, seed, bay, floor, side) {
  const column = (bay + Math.floor(seed * 31 + side)) % 4
  const row = (floor + Math.floor(seed * 17)) % 4
  return windowPatternHash(column, row, family) > (family === 3 ? .59 : .72) ? 1 : 0
}

// Bake the complete window masks before drawing, then average them through a
// mip chain. Unlike a per-fragment random hash, a subpixel lit window contributes
// its area instead of blinking on and off as a pixel moves across its boundary.
export function createFacadePatternTexture() {
  const width = 512, height = 256, tileSize = 128, padding = 16, patternSize = 96, cellSize = 24
  const data = new Uint8Array(width * height * 4)
  for (let tile = 0; tile < 8; tile++) {
    const family = tile % ARCHITECTURE_FAMILIES.length
    const office = family === 3, paired = family === 2 || office
    for (let y = 0; y < tileSize; y++) for (let x = 0; x < tileSize; x++) {
      const px = ((x - padding) % patternSize + patternSize) % patternSize
      const py = ((y - padding) % patternSize + patternSize) % patternSize
      const bay = Math.floor(px / cellSize), floor = Math.floor(py / cellSize)
      const u = (px % cellSize + .5) / cellSize, v = (py % cellSize + .5) / cellSize
      const variant = (bay + Math.floor(bay / 3)) % 2
      let halfX = office ? .39 : paired ? .34 : .22, halfY = office ? .37 : .29
      if (family === 0 && variant === 0) { halfX = .28; halfY = .33 }
      if (family === 4) { halfX = .25; halfY = .37 }
      const offset = family === 1 || family === 5 ? (variant - .5) * .17 : 0
      const du = Math.abs(u - .5 - offset), dv = Math.abs(v - .51)
      const window = du < halfX && dv < halfY
      const surround = du < halfX + .025 && dv < halfY + .022
      const pane = du < halfX - .021 && dv < halfY - .018 && du > (paired ? .017 : .01)
      const lit = windowPatternHash(bay, floor, family) > (office ? .59 : .72)
      const cornice = (floor + 1) % ARCHITECTURE_FAMILIES[family].corniceEvery === 0
      const band = cornice && Math.min(v, 1 - v) < .035
      const index = (((tile >> 2) * tileSize + y) * width + (tile % 4) * tileSize + x) * 4
      data[index] = window ? 255 : 0
      data[index + 1] = surround ? 255 : 0
      data[index + 2] = pane && lit ? 255 : 0
      data[index + 3] = band ? 255 : 0
    }
  }
  const texture = new THREE.DataTexture(data, width, height)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.mipmaps = [{ data, width, height }]
  let level = texture.mipmaps[0]
  while (level.width > 1 || level.height > 1) {
    const w = Math.max(1, level.width / 2), h = Math.max(1, level.height / 2)
    const reduced = new Uint8Array(w * h * 4)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let channel = 0; channel < 4; channel++) {
      let sum = 0
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const sourceX = Math.min(level.width - 1, x * 2 + dx), sourceY = Math.min(level.height - 1, y * 2 + dy)
        sum += level.data[(sourceY * level.width + sourceX) * 4 + channel]
      }
      reduced[(y * w + x) * 4 + channel] = Math.round(sum / 4)
    }
    level = { data: reduced, width: w, height: h }
    texture.mipmaps.push(level)
  }
  texture.needsUpdate = true
  return texture
}

function distantMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      facadePalette: { value: ARCHITECTURE_FAMILIES.map(f => new THREE.Vector3(...f.palette)) },
      facadeTrim: { value: ARCHITECTURE_FAMILIES.map(f => new THREE.Vector3(...f.trim)) },
      facadeGlass: { value: ARCHITECTURE_FAMILIES.map(f => new THREE.Vector3(...f.glass)) },
      facadePattern: { value: createFacadePatternTexture() },
    },
    vertexShader: /* glsl */ `
      attribute vec2 facadeCell;
      attribute vec3 facadeStyle;
      varying vec2 vCell;
      varying vec3 vStyle;
      varying vec3 vNormal;
      varying float vDistance;
      void main() {
        vCell = facadeCell;
        vStyle = facadeStyle;
        vNormal = mat3(modelMatrix) * normal;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.);
        vDistance = length(viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 facadePalette[6];
      uniform vec3 facadeTrim[6];
      uniform vec3 facadeGlass[6];
      uniform sampler2D facadePattern;
      varying vec2 vCell;
      varying vec3 vStyle;
      varying vec3 vNormal;
      varying float vDistance;
      void main() {
        int family = int(vStyle.x + .5);
        float seed = vStyle.y;
        bool roof = vStyle.z < -.5;
        float side = max(vStyle.z, 0.);
        vec2 tile = vec2(mod(float(family),4.),floor(float(family)/4.));
        vec2 phase = floor(vec2(seed * 31. + side,seed * 17.));
        vec2 patternUv = (tile * 128. + 16. + fract((vCell + phase) * .25) * 96.) / vec2(512.,256.);
        // Derivatives are taken before wrapping; atlas seams must not force an
        // unrelated coarse mip level as the viewer moves across a tile edge.
        vec2 dx = dFdx(vCell) * 24. / vec2(512.,256.);
        vec2 dy = dFdy(vCell) * 24. / vec2(512.,256.);
        vec4 mask = texture2DGradEXT(facadePattern,patternUv,dx,dy);
        float moon = max(dot(normalize(vNormal), normalize(vec3(-.35,.78,.42))), 0.);
        float illumination = .055 + moon * .075;
        vec3 color = facadePalette[family] * illumination;
        color = mix(color,facadeTrim[family] * illumination * .8,mask.g * .8);
        color = mix(color,facadeGlass[family] * (.014 + moon * .012),mask.r);
        vec3 temperature = mix(vec3(.63,.78,1.),vec3(1.,.79,.50),step(.46,seed));
        color += mask.b * temperature * facadeGlass[family] * .23;
        color = mix(color,facadeTrim[family] * illumination * .7,mask.a * .7);
        if (roof) color = facadePalette[family] * .045;
        float haze = min((1.-exp(-vDistance*.00016))*.5,.5);
        color = mix(color,vec3(.012,.019,.029),haze);
        gl_FragColor = vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}

export function createDistantArchitecture(buildings) {
  const positions = [], normals = [], cells = [], styles = [], entries = []
  const vertex = (x, y, z, nx, ny, nz, u, v, b, side) => {
    const index = positions.length / 3
    positions.push(x, y, z); normals.push(nx, ny, nz)
    cells.push(u, v); styles.push(b.familyIndex, b.paletteSeed, side)
    return index
  }
  let indexCount = 0
  for (const b of buildings) {
    const indices = []
    b.faces.forEach((face, side) => {
      const dx = Math.cos(face.yaw) * face.length, dz = -Math.sin(face.yaw) * face.length
      const [nx, , nz] = face.normal, top = b.y + b.h, levels = b.h / b.floorHeight
      const a = vertex(face.x, b.y, face.z, nx, 0, nz, 0, 0, b, side)
      const c = vertex(face.x + dx, b.y, face.z + dz, nx, 0, nz, face.bays, 0, b, side)
      const d = vertex(face.x + dx, top, face.z + dz, nx, 0, nz, face.bays, levels, b, side)
      const e = vertex(face.x, top, face.z, nx, 0, nz, 0, levels, b, side)
      indices.push(a, c, d, a, d, e)
    })
    // Polygon winding matches both the rectangular and chorded round source.
    const roof = b.faces.map(face => vertex(face.x, b.y + b.h, face.z, 0, 1, 0, 0, 0, b, -1))
    for (let i = 1; i < roof.length - 1; i++) indices.push(roof[0], roof[i], roof[i + 1])
    entries.push({ indices: new Uint32Array(indices), count: indices.length })
    indexCount += indices.length
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('facadeCell', new THREE.Float32BufferAttribute(cells, 2))
  geometry.setAttribute('facadeStyle', new THREE.Float32BufferAttribute(styles, 3))
  const index = new THREE.BufferAttribute(new Uint32Array(indexCount), 1)
  index.setUsage(THREE.DynamicDrawUsage)
  geometry.setIndex(index)
  geometry.setDrawRange(0, 0)
  const mesh = new THREE.Mesh(geometry, distantMaterial())
  mesh.name = 'real-city-distant-facades'
  mesh.frustumCulled = false
  mesh.raycast = () => null
  return { mesh, entries, dispose() {
    geometry.dispose()
    mesh.material.uniforms.facadePattern.value.dispose()
    mesh.material.dispose()
  }, pack(state) {
    let offset = 0
    for (let i = 0; i < entries.length; i++) if (state[i] === 2) {
      index.array.set(entries[i].indices, offset)
      offset += entries[i].count
    }
    geometry.setDrawRange(0, offset)
    index.clearUpdateRanges()
    if (offset) { index.addUpdateRange(0, offset); index.needsUpdate = true }
  } }
}

// The source file is a showroom of separate construction pieces, not a building.
// These instances assemble its real wall openings, glazing, frames, bases and
// mouldings into closed, correctly scaled four-sided buildings on existing lots.
export function assembleArchitecture(layout) {
  const buildings = [
    ...(Array.isArray(layout) ? layout : layout.boxes || []).filter(realBuildingEligible).map(planRealBuilding),
    ...(Array.isArray(layout) ? [] : layout.rounds || []).filter(realRoundEligible).map(planRealRound),
  ]
  const modules = new Map()
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0)
  const position = new THREE.Vector3(), scale = new THREE.Vector3()
  const add = (name, buildingIndex, x, y, z, yaw, sx, sy = sx, sz = sx, glow = 0) => {
    let entry = modules.get(name)
    if (!entry) { entry = new Map(); modules.set(name, entry) }
    let values = entry.get(buildingIndex)
    if (!values) { values = { matrices: [], glow: [] }; entry.set(buildingIndex, values) }
    position.set(x, y, z); scale.set(sx, sy, sz); rotation.setFromAxisAngle(up, yaw)
    matrix.compose(position, rotation, scale)
    values.matrices.push(...matrix.elements)
    values.glow.push(glow)
  }
  buildings.forEach((b, buildingIndex) => {
    const core = planStructuralCore(b)
    add(core.segments ? `coreRound-${core.segments}` : 'core', buildingIndex,
      core.x, core.y, core.z, core.yaw, core.w, core.h, core.d)
    const family = b.family
    const sy = b.floorHeight / 3
    b.faces.forEach((face, sideIndex) => {
      const sx = face.bayWidth / 3, alongX = Math.cos(face.yaw), alongZ = -Math.sin(face.yaw)
      const depth = Math.min(1, sx)
      for (let bay = 0; bay < face.bays; bay++) {
        const x = face.x + alongX * (bay + 1) * face.bayWidth
        const z = face.z + alongZ * (bay + 1) * face.bayWidth
        for (let floor = 0; floor < b.floors; floor++) {
          const y = b.y + floor * b.floorHeight
          const entrance = floor === 0 && sideIndex === 0 && bay === Math.floor(face.bays / 2)
          // Keep a coherent window rhythm within a facade. Alternate paired
          // asymmetric openings and architectural corner bays, rather than
          // randomly changing window type in every individual room.
          const variant = Math.floor(b.paletteSeed * 17 + sideIndex + bay / 3) % family.windows.length
          const [wall, window] = entrance ? ['wall_door_centered_large_01', 'door_centered_large_01'] : family.windows[variant]
          add(wall, buildingIndex, x, y, z, face.yaw, sx, sy, depth)
          add(window, buildingIndex, x, y, z, face.yaw, sx, sy, depth,
            facadeWindowLight(b.familyIndex, b.paletteSeed, bay, floor, sideIndex))
          if ((floor + 1) % family.corniceEvery === 0 || floor === b.floors - 1) {
            const bandHeight = b.familyIndex === 3 ? .08 : b.familyIndex === 2 ? .14 : .2 * sy
            add('cornice_standard_standard_01', buildingIndex, x, y + b.floorHeight - bandHeight, z, face.yaw, sx, bandHeight / .2, depth)
          }
          if (family.pierEvery && bay % family.pierEvery === 0) {
            const px = x - alongX * face.bayWidth, pz = z - alongZ * face.bayWidth
            add('wall_pier_standard_01', buildingIndex, px, y, pz, face.yaw, family.pierWidth, sy, depth)
          }
          if (b.familyIndex === 4 && floor > 0 && (bay + sideIndex) % 2 === 0) {
            // Shallow Juliet balconies use the kit's real moulded ledge,
            // profiled metal-height rail and narrow source pier posts.
            const nx = face.normal[0], nz = face.normal[2]
            add('crown_standard_standard_01', buildingIndex, x + nx * .1, y + .02, z + nz * .1, face.yaw, sx, .14, .65)
            add('cornice_standard_standard_01', buildingIndex, x + nx * .22, y + .97, z + nz * .22, face.yaw, sx, .28, .7)
            for (const end of [.08, .92]) add('wall_pier_standard_01', buildingIndex,
              x - alongX * face.bayWidth * end + nx * .22, y + .1,
              z - alongZ * face.bayWidth * end + nz * .22, face.yaw, .25, .29, .6)
          }
        }
        if (b.y === 0) add('base_standard_01', buildingIndex, x, b.y, z, face.yaw, sx, Math.min(sy, b.h / .75), depth)
        add('crown_standard_standard_01', buildingIndex, x, b.y + b.floors * b.floorHeight, z,
          face.yaw, sx, b.crownHeight / .75, depth)
        if (family.pierEvery && bay % family.pierEvery === 0 && b.familyIndex === 0)
          add('crown_pier_pedestal_01', buildingIndex, x - alongX * face.bayWidth,
            b.y + b.floors * b.floorHeight + .05 * b.crownHeight / .83,
            z - alongZ * face.bayWidth, face.yaw, .9, b.crownHeight / .83, Math.min(depth, .7))
      }
    })
    // The cap is an ordinary construction roof; all visible vertical architecture
    // above comes from the downloaded model, including its cornice silhouette.
    add(b.shape === 'round' ? 'roofRound' : 'roof', buildingIndex, b.x, b.y + b.h - b.crownHeight * .45, b.z, b.yaw || 0, b.w, 1, b.d)
  })
  return {
    buildings,
    modules: [...modules].map(([name, entries]) => ({
      name, entries: [...entries].map(([buildingIndex, values]) => ({
        buildingIndex, values: new Float32Array(values.matrices), glow: new Float32Array(values.glow),
        count: values.matrices.length / 16,
        style: [buildings[buildingIndex].familyIndex, buildings[buildingIndex].paletteSeed],
      })),
      count: [...entries.values()].reduce((sum, values) => sum + values.matrices.length / 16, 0),
    })),
  }
}
