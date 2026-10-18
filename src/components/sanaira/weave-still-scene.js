import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, forms, smooth, vesselVertices, weaveCenter, WEAVE_RINGS, WEAVE_SIDES } from './continuum-math.js';

/*
 * Still Care Weave — the same physical object as the homepage journey, held
 * in one composed pose inside its own canvas. There is no scroll morph:
 * only the independent self-turn (slowed via `turnSeconds`) runs, at 30 fps,
 * and only while visible. Reduced motion renders a single still frame.
 *
 * Material, lighting and ambient occlusion values mirror CareContinuum.jsx
 * so both renderings read as one object in light and dark themes.
 */
const FRAME_INTERVAL = 1000 / 30;
const TAU = Math.PI * 2;

/**
 * Round pose for the still weave: three equal, linked circles (one continuous
 * ribbon) with no skew or ellipse terms, so no part of the loop can pinch into
 * a corner. Depth, ribbon width and twist come from the chapter form.
 */
function roundPose(form) {
  // A slimmer ribbon than the homepage journey: finer, smoother curves.
  return { ...form, rx: 1.44, ry: 1.44, skew: 0, braid: .04, offset: .17, round: true, rotation: [.16, -.2, 0], width: form.width * .9, thickness: form.thickness * 1.06 };
}
const MINERAL_TINTS = ['#8eaa99', '#638f87', '#aca48a'];
const DARK_TINTS = ['#dce6d8', '#d7e6d8', '#d3e5e1', '#e0e2d4', '#d9e7d6', '#e6e2d5'];

function softenClosedSeams(geometry, rings, sides) {
  const normals = geometry.attributes.normal;
  const join = (a, b) => {
    const x = normals.getX(a) + normals.getX(b), y = normals.getY(a) + normals.getY(b), z = normals.getZ(a) + normals.getZ(b);
    const length = Math.hypot(x, y, z) || 1;
    normals.setXYZ(a, x / length, y / length, z / length); normals.setXYZ(b, x / length, y / length, z / length);
  };
  for (let i = 0; i <= rings; i++) join(i * (sides + 1), i * (sides + 1) + sides);
  for (let j = 0; j <= sides; j++) join(j, rings * (sides + 1) + j);
  normals.needsUpdate = true;
}

/**
 * Mounts a still weave canvas into `host`. Returns a dispose function.
 * options: { form: 0–5, turnSeconds, fill: fraction of the canvas the weave occupies,
 *   shadow: false to omit the contact shadow, time: start phase in seconds,
 *   shape: pose overrides (e.g. a thicker ribbon for the logo mark),
 *   material: MeshPhysicalMaterial overrides (finish tweaks) }
 */
/** Extra canvas margin around the host on each side (fraction of its size). */
const OVERSCAN = .22;

export function mountWeaveStill(host, { form = 0, turnSeconds = 44, fill = .8, shadow: castShadow = true, time = 0, shape = null, material: materialOverrides = null } = {}) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || root.classList.contains('motion-quiet');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { host.dataset.status = 'fallback'; return () => {}; }

  const canvas = renderer.domElement;
  canvas.className = 'sn-weave__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, .1, 40);
  camera.position.z = 12;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // Keep the initial blur within the 256px PMREM kernel's sample budget.
  // The material's roughness supplies the broader reflection filtering.
  const environment = pmrem.fromScene(room, .035);
  scene.environment = environment.texture;
  room.dispose();
  const keyLight = new THREE.DirectionalLight('#fff5e5', 2.35);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.camera.right = keyLight.shadow.camera.top = 5;
  keyLight.shadow.radius = 7; keyLight.shadow.bias = -.001; keyLight.shadow.normalBias = .006;
  const fillLight = new THREE.HemisphereLight('#fff4e6', '#405a50', .58);
  const rim = new THREE.DirectionalLight('#e5e9db', 1.3);
  rim.position.set(5, 1, 4);
  scene.add(keyLight, keyLight.target, fillLight, rim);

  const rings = WEAVE_RINGS, sides = WEAVE_SIDES;
  const formIndex = clamp(Math.round(form), 0, forms.length - 1);
  const pose = { ...roundPose(forms[formIndex]), ...shape };
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(vesselVertices(pose, rings, sides), 3);
  position.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', position);
  const indices = [], colors = [];
  const strands = (pose.tints || MINERAL_TINTS).map(tint => new THREE.Color(tint));
  for (let i = 0; i <= rings; i++) for (let j = 0; j <= sides; j++) {
    const u = i / rings * Math.PI * 2;
    const weights = [0, 1, 2].map(k => (1 + Math.cos(u - k * Math.PI * 2 / 3)) / 3);
    const face = .97 + .03 * Math.cos(j / sides * Math.PI * 2);
    for (const channel of ['r', 'g', 'b']) colors.push(strands.reduce((sum, tint, k) => sum + tint[channel] * weights[k], 0) * face);
    if (i < rings && j < sides) { const a = i * (sides + 1) + j, b = a + sides + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  geometry.setIndex(indices);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const mineral = Float32Array.from(colors), surface = geometry.attributes.color;
  geometry.computeVertexNormals();
  softenClosedSeams(geometry, rings, sides);

  // Restrained geometric ambient occlusion where woven passes face each other.
  const normals = geometry.attributes.normal;
  for (let i = 0; i <= rings; i++) {
    const u = i / rings * Math.PI * 2;
    const neighbours = [weaveCenter(pose, u + Math.PI * 2 / 3), weaveCenter(pose, u + Math.PI * 4 / 3)];
    for (let j = 0; j <= sides; j++) {
      const vertex = i * (sides + 1) + j, offset = vertex * 3;
      // Soft facing window + smoothstep falloff, combined multiplicatively:
      // no occlusion edge can form a line along the ribbon.
      let shade = 1;
      for (const centre of neighbours) {
        const dx = centre[0] - position.array[offset], dy = centre[1] - position.array[offset + 1], dz = centre[2] - position.array[offset + 2];
        const distance = Math.hypot(dx, dy, dz) || 1;
        const facing = smooth(((normals.getX(vertex) * dx + normals.getY(vertex) * dy + normals.getZ(vertex) * dz) / distance + .35) / 1.1);
        const near = 1 - smooth((distance - pose.width * .6) / .36);
        shade *= 1 - near * facing * .16;
      }
      for (let axis = 0; axis < 3; axis++) surface.array[offset + axis] = mineral[offset + axis] * shade;
    }
  }
  surface.needsUpdate = true;

  // Opaque on purpose (no transmission): see CareContinuum.jsx.
  const material = new THREE.MeshPhysicalMaterial({ color: pose.color, vertexColors: true, metalness: .16, roughness: .32, clearcoat: .52, clearcoatRoughness: .48, sheen: .16, sheenColor: '#eff4e9', sheenRoughness: .39, ior: 1.44, side: THREE.DoubleSide, ...materialOverrides });
  const mesh = new THREE.Mesh(geometry, material);
  // The ribbon casts its contact shadow onto the backdrop only. It never receives
    // shadows (its own or a neighbouring pass's): shadow-map edges and the
    // self-shadow terminator read as hard cuts on a smooth convex surface.
    mesh.castShadow = true; mesh.receiveShadow = false; mesh.frustumCulled = false;
  mesh.rotation.set(...pose.rotation);
  const macro = new THREE.Group();
  macro.add(mesh); scene.add(macro);
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: .14, color: '#26382c' });
  // Backdrop only: drawn first and never depth-tested, so ribbon parts that
  // turn behind the plane are never overlaid by its shadow (a moving cap).
  Object.assign(shadowMaterial, { transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor, depthTest: false, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(40, 25), shadowMaterial);
  shadow.position.z = -1.1; shadow.receiveShadow = true; shadow.renderOrder = -1; if (castShadow) scene.add(shadow);

  const base = position.array.slice();
  const v = new THREE.Vector3(), matrix = new THREE.Matrix4();
  let width = 0, height = 0, ready = false;
  let raf = 0, last = 0, lastDraw = -Infinity, elapsed = time, visible = true, disposed = false;

  const fit = () => {
    // The canvas overscans the host (see OVERSCAN) so the soft contact
    // shadow is never cut by the canvas edge; the weave keeps its size.
    const hostWidth = Math.max(1, host.clientWidth), hostHeight = Math.max(1, host.clientHeight);
    width = Math.round(hostWidth * (1 + OVERSCAN * 2)); height = Math.round(hostHeight * (1 + OVERSCAN * 2));
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(width, height, false);
    camera.left = -3 * width / height; camera.right = 3 * width / height; camera.top = 3; camera.bottom = -3;
    camera.updateProjectionMatrix();
    // Scale the posed body to `fill` of the host's smaller side, centred.
    const units = 6 / height, target = Math.min(hostWidth, hostHeight) * fill;
    macro.position.set(0, 0, 0); macro.scale.set(1, 1, 1); macro.updateMatrixWorld(true);
    matrix.copy(mesh.matrixWorld); matrix.setPosition(0, 0, 0);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < position.count; i++) {
      v.fromArray(base, i * 3).applyMatrix4(matrix);
      minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    }
    const scale = target * units / Math.max(maxX - minX, maxY - minY);
    macro.scale.set(scale, scale, scale);
    macro.position.set(-(minX + maxX) * .5 * scale, -(minY + maxY) * .5 * scale, 0);
    macro.updateMatrixWorld(true);
    keyLight.target.position.set(macro.position.x, macro.position.y, 0);
    keyLight.position.set(macro.position.x - 3, macro.position.y + 5, 12);
    keyLight.target.updateMatrixWorld();
    // The round loops keep their centre clear on their own; content inside is
    // sized to the inner opening.
    host.style.setProperty('--weave-chamber', `${Math.round(target * .5)}px`);
    ready = true;
  };

  // Motion: the whole object turns around its own centre (so colour bands and
  // highlights travel round the rings), tilts gently so the light moves across
  // its convex faces, and breathes only slightly in shape. The circles never
  // deform, so no corners can form and the centre stays clear.
  const draw = () => {
    const t = elapsed / turnSeconds;
    const breathe = { ...pose, offset: pose.offset * (1 + .1 * Math.sin(t * TAU * 1.4)), depth: pose.depth * (1 + .08 * Math.sin(t * TAU * .9 + 1.2)) };
    position.array.set(vesselVertices(breathe, rings, sides));
    position.needsUpdate = true;
    geometry.computeVertexNormals(); softenClosedSeams(geometry, rings, sides);
    mesh.rotation.set(pose.rotation[0] + .12 * Math.sin(t * TAU * 1.1), pose.rotation[1] + .12 * Math.cos(t * TAU * .8), pose.rotation[2] - t * TAU);
    renderer.render(scene, camera);
  };
  const tick = time => {
    raf = 0;
    if (disposed || !visible || document.hidden || quiet()) { last = 0; return; }
    if (last) elapsed += (time - last) / 1000;
    last = time;
    if (time - lastDraw >= FRAME_INTERVAL) { draw(); lastDraw = time; }
    raf = requestAnimationFrame(tick);
  };
  const request = () => { if (!raf && !disposed) raf = requestAnimationFrame(tick); };
  const refresh = () => { if (disposed) return; fit(); draw(); if (!quiet()) request(); };

  const applyTheme = () => {
    const dark = root.dataset.theme === 'dark';
    renderer.toneMappingExposure = dark ? .93 : 1.02;
    scene.environmentIntensity = dark ? .58 : .78;
    keyLight.intensity = dark ? 2.0 : 2.35;
    keyLight.color.set(dark ? '#f4dfc7' : '#fff5e5');
    fillLight.intensity = dark ? .42 : .58;
    fillLight.color.set(dark ? '#d2dccb' : '#fff4e6');
    fillLight.groundColor.set(dark ? '#172e25' : '#405a50');
    rim.color.set(dark ? '#d4e0c9' : '#e5e9db');
    rim.intensity = dark ? 1.65 : 1.3;
    material.roughness = dark ? .35 : .32;
    material.clearcoat = dark ? .44 : .52;
    material.sheenColor.set(dark ? '#d4d7c5' : '#fff2df');
    material.color.set(dark ? DARK_TINTS[formIndex] : pose.color);
    shadowMaterial.opacity = dark ? .28 : .136;
    shadowMaterial.color.set(dark ? '#030907' : '#26382c');
    if (ready) draw();
  };

  const resize = new ResizeObserver(refresh);
  resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); });
  intersection.observe(host);
  const onMotion = () => refresh();
  const onVisibility = () => { if (!document.hidden) request(); };
  const onContextLost = event => { event.preventDefault(); host.dataset.status = 'fallback'; dispose(); };
  reduced.addEventListener('change', onMotion);
  document.addEventListener('visibilitychange', onVisibility);
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  canvas.addEventListener('webglcontextlost', onContextLost);

  applyTheme(); fit(); draw();
  host.dataset.status = 'ready';
  host.dataset.motion = quiet() ? 'still' : 'idle';
  if (!quiet()) request();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    resize.disconnect(); intersection.disconnect();
    reduced.removeEventListener('change', onMotion);
    document.removeEventListener('visibilitychange', onVisibility);
    themeObserver.disconnect();
    canvas.removeEventListener('webglcontextlost', onContextLost);
    geometry.dispose(); material.dispose(); shadow.geometry.dispose(); shadowMaterial.dispose();
    environment.dispose(); pmrem.dispose(); renderer.dispose(); canvas.remove();
  }
  return dispose;
}
