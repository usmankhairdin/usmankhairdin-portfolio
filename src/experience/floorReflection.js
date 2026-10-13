import * as THREE from 'three'

/*
 * One shared planar reflection for the corridor floor, adapted from the Shahz Connect
 * corridor (world/reflection.js), used with the owner's permission.
 *
 * The scene is rendered once per frame from a camera mirrored about the floor plane (with an
 * oblique near plane so nothing below the floor leaks in), into a mip-mapped HDR target. The
 * floor material samples it projectively; roughness picks the mip level, the normal map
 * distorts it and Fresnel weights it. Only the corridor floor uses it - the rooms are untouched.
 */
class FloorReflection {
  constructor(height = 0) {
    this.enabled = true
    this.scale = 0.5
    this.rt = new THREE.WebGLRenderTarget(16, 16, {
      type: THREE.HalfFloatType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
    })
    this.rt.texture.name = 'CorridorFloorReflection'
    this.virtualCamera = new THREE.PerspectiveCamera()
    this.textureMatrix = new THREE.Matrix4()
    this.hidden = new Set() // objects hidden while rendering the reflection (the floor, dust)
    this.uniforms = {
      uReflTex: { value: this.rt.texture },
      uReflMatrix: { value: this.textureMatrix },
      uReflLod: { value: 6.0 },
      uReflStrength: { value: 1.0 },
      uReflDistort: { value: 0.035 },
      uReflTexel: { value: new THREE.Vector2(1 / 16, 1 / 16) },
    }
    this._plane = new THREE.Plane()
    this._normal = new THREE.Vector3(0, 1, 0)
    this._pos = new THREE.Vector3(0, height, 0)
    this._cam = new THREE.Vector3()
    this._rot = new THREE.Matrix4()
    this._look = new THREE.Vector3()
    this._target = new THREE.Vector3()
    this._view = new THREE.Vector3()
    this._clip = new THREE.Vector4()
    this._q = new THREE.Vector4()
  }

  setHeight(y) {
    this._pos.y = y
  }

  setSize(w, h) {
    const rw = Math.max(64, Math.round(w * this.scale))
    const rh = Math.max(64, Math.round(h * this.scale))
    if (this.rt.width !== rw || this.rt.height !== rh) {
      this.rt.setSize(rw, rh)
      this.uniforms.uReflTexel.value.set(1 / rw, 1 / rh)
      this.uniforms.uReflLod.value = Math.max(3, Math.log2(Math.max(rw, rh)) - 3)
    }
  }

  /** Injects reflection sampling into a MeshStandardMaterial. */
  attach(material) {
    const u = this.uniforms
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vReflWorld;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvReflWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vReflWorld;
          uniform sampler2D uReflTex;
          uniform mat4 uReflMatrix;
          uniform float uReflLod;
          uniform float uReflStrength;
          uniform float uReflDistort;
          uniform vec2 uReflTexel;`,
        )
        .replace(
          '#include <opaque_fragment>',
          `{
            vec4 rc = uReflMatrix * vec4(vReflWorld, 1.0);
            vec2 ruv = rc.xy / rc.w;
            vec3 nGeo = normalize(vNormal);
            ruv += (normal.xy - nGeo.xy) * uReflDistort;
            float rough = clamp(roughnessFactor, 0.0, 1.0);
            float lod = rough * uReflLod;
            vec2 o = uReflTexel * exp2(lod) * 0.75;
            vec3 refl = textureLod(uReflTex, ruv, lod).rgb * 0.4;
            refl += textureLod(uReflTex, ruv + vec2(o.x, o.y), lod).rgb * 0.15;
            refl += textureLod(uReflTex, ruv + vec2(-o.x, o.y), lod).rgb * 0.15;
            refl += textureLod(uReflTex, ruv + vec2(o.x, -o.y), lod).rgb * 0.15;
            refl += textureLod(uReflTex, ruv + vec2(-o.x, -o.y), lod).rgb * 0.15;
            vec3 V = normalize(vViewPosition);
            float NdV = clamp(dot(normal, V), 0.0, 1.0);
            float fres = 0.04 + 0.96 * pow(1.0 - NdV, 5.0);
            float gloss = pow(1.0 - rough, 2.2);
            outgoingLight += refl * fres * gloss * uReflStrength;
          }
          #include <opaque_fragment>`,
        )
    }
    material.customProgramCacheKey = () => 'corridor-floor-reflection'
  }

  update(renderer, scene, camera) {
    if (!this.enabled) return
    const cam = this._cam.setFromMatrixPosition(camera.matrixWorld)
    if (cam.y <= this._pos.y + 0.001) return
    const vc = this.virtualCamera
    this._rot.extractRotation(camera.matrixWorld)
    this._view.subVectors(this._pos, cam).reflect(this._normal).negate().add(this._pos)
    this._look.set(0, 0, -1).applyMatrix4(this._rot).add(cam)
    this._target.subVectors(this._pos, this._look).reflect(this._normal).negate().add(this._pos)
    vc.position.copy(this._view)
    vc.up.set(0, 1, 0).applyMatrix4(this._rot).reflect(this._normal)
    vc.lookAt(this._target)
    vc.far = camera.far
    vc.near = camera.near
    vc.updateMatrixWorld()
    vc.projectionMatrix.copy(camera.projectionMatrix)
    vc.layers.mask = camera.layers.mask

    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
    this.textureMatrix.multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse)

    // oblique near plane = floor plane (Lengyel)
    this._plane.setFromNormalAndCoplanarPoint(this._normal, this._pos).applyMatrix4(vc.matrixWorldInverse)
    const clip = this._clip.set(this._plane.normal.x, this._plane.normal.y, this._plane.normal.z, this._plane.constant)
    const pm = vc.projectionMatrix.elements
    const q = this._q
    q.x = (Math.sign(clip.x) + pm[8]) / pm[0]
    q.y = (Math.sign(clip.y) + pm[9]) / pm[5]
    q.z = -1.0
    q.w = (1.0 + pm[10]) / pm[14]
    clip.multiplyScalar(2.0 / clip.dot(q))
    pm[2] = clip.x
    pm[6] = clip.y
    pm[10] = clip.z + 1.0 - 0.003
    pm[14] = clip.w

    const prevTarget = renderer.getRenderTarget()
    const prevAutoClear = renderer.autoClear
    const states = []
    for (const o of this.hidden) {
      states.push([o, o.visible])
      o.visible = false
    }
    renderer.autoClear = true
    renderer.setRenderTarget(this.rt)
    renderer.clear()
    renderer.render(scene, vc)
    renderer.setRenderTarget(prevTarget)
    renderer.autoClear = prevAutoClear
    for (const [o, v] of states) o.visible = v
  }
}

export const floorReflection = new FloorReflection(-0.075)
