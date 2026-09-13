import * as THREE from "three";

/** A single continuous surface; each adjoining panel carries a real project capture. */
export async function createProjectRibbon(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  sources: string[],
  onReady: () => void,
): Promise<() => void> {
  const panelWidth = 8.5;
  const panelHeight = 2.55;
  const columns = 48;
  const rows = 16;
  const totalHeight = panelHeight * sources.length;
  const textures: THREE.Texture[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const removeListeners: Array<() => void> = [];
  const scene = new THREE.Scene();
  const ribbon = new THREE.Group();
  const camera = new THREE.OrthographicCamera(-7, 7, 9, -9, 0.1, 100);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  let renderer: THREE.WebGLRenderer | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;
  let pauseObserver: MutationObserver | undefined;
  let disposed = false;
  let contextLost = false;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let scroll = 0;
  let scrollTarget = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    pauseObserver?.disconnect();
    removeListeners.forEach((remove) => remove());
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    scene.clear();
    renderer?.dispose();
    renderer?.forceContextLoss();
  };

  try {
    if (!sources.length) throw new Error("Project ribbon requires project captures.");

    const loader = new THREE.TextureLoader();
    const loadedTextures = await Promise.all(sources.map((source) => new Promise<THREE.Texture>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Project capture timed out.")), 15_000);
      loader.load(source, (texture) => {
        window.clearTimeout(timeout);
        if (disposed) {
          texture.dispose();
          reject(new Error("Project ribbon was disposed."));
          return;
        }
        textures.push(texture);
        resolve(texture);
      }, undefined, () => {
        window.clearTimeout(timeout);
        reject(new Error("Project capture could not be loaded."));
      });
    })));

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    camera.position.set(0, 0, 35);
    camera.lookAt(0, 0, 0);
    scene.add(ribbon);

    const panels = loadedTextures.map((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer!.capabilities.getMaxAnisotropy());
      const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight, columns, rows);
      const image = texture.image as { width: number; height: number };
      const cropHeight = Math.min(1, (image.width / image.height) / (panelWidth / panelHeight));
      const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
      for (let index = 0; index < uv.count; index += 1) {
        // UV 1 is the image top. The ribbon shows an undistorted crop of the actual page.
        uv.setY(index, 1 - (1 - uv.getY(index)) * cropHeight);
        // The source pages are desktop captures. The left editorial surface carries their
        // identity without introducing the empty right-side browser canvas into the ribbon.
        uv.setX(index, 0.015 + uv.getX(index) * 0.76);
      }
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xa6b0b0,
        side: THREE.FrontSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      // Positions breathe within known bounds; avoid reculling every deformed panel.
      mesh.frustumCulled = false;
      ribbon.add(mesh);
      geometries.push(geometry);
      materials.push(material);
      return geometry.getAttribute("position") as THREE.BufferAttribute;
    });

    const edgeSteps = rows * sources.length;
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xe4edbf, transparent: true, opacity: 0.74 });
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0xe6d9b8, transparent: true, opacity: 0.42 });
    materials.push(edgeMaterial, seamMaterial);
    const makeLine = (count: number, material: THREE.LineBasicMaterial) => {
      const geometry = new THREE.BufferGeometry();
      const position = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
      geometry.setAttribute("position", position);
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      ribbon.add(line);
      geometries.push(geometry);
      return position;
    };
    const leftEdge = makeLine(edgeSteps + 1, edgeMaterial);
    const rightEdge = makeLine(edgeSteps + 1, edgeMaterial);
    const seams = Array.from({ length: sources.length + 1 }, () => makeLine(columns + 1, seamMaterial));

    const point = new THREE.Vector3();
    const surface = (across: number, down: number, time: number, progress: number) => {
      const rhythm = down * Math.PI * 2.15 + progress * 0.48;
      const breathe = Math.sin(time * 0.19) * 0.032;
      const twist = Math.sin(rhythm + 0.4) * (0.62 + breathe);
      const x = across * panelWidth;
      point.set(
        x * Math.cos(twist) + Math.sin(down * Math.PI * 2 + 0.2) * 0.42,
        totalHeight * (0.5 - down) + x * Math.sin(rhythm - 0.3) * 0.14,
        x * Math.sin(twist) + Math.cos(rhythm) * 0.22,
      );
      return point;
    };

    const compose = () => {
      const time = reduceMotion.matches ? 0 : elapsed;
      const progress = reduceMotion.matches ? 0 : scroll;
      panels.forEach((position, panelIndex) => {
        for (let row = 0; row <= rows; row += 1) {
          const down = (panelIndex + row / rows) / sources.length;
          for (let column = 0; column <= columns; column += 1) {
            const value = surface(column / columns - 0.5, down, time, progress);
            position.setXYZ(row * (columns + 1) + column, value.x, value.y, value.z);
          }
        }
        position.needsUpdate = true;
      });
      for (let index = 0; index <= edgeSteps; index += 1) {
        const down = index / edgeSteps;
        let value = surface(-0.5, down, time, progress);
        leftEdge.setXYZ(index, value.x, value.y, value.z + 0.008);
        value = surface(0.5, down, time, progress);
        rightEdge.setXYZ(index, value.x, value.y, value.z + 0.008);
      }
      leftEdge.needsUpdate = true;
      rightEdge.needsUpdate = true;
      seams.forEach((position, seamIndex) => {
        for (let column = 0; column <= columns; column += 1) {
          const value = surface(column / columns - 0.5, seamIndex / sources.length, time, progress);
          position.setXYZ(column, value.x, value.y, value.z + 0.008);
        }
        position.needsUpdate = true;
      });
      ribbon.rotation.set(pointerY * 0.025, pointerX * 0.045, -0.10 + progress * 0.022);
      ribbon.position.set(pointerX * 0.08, progress * 0.24, 0);
    };

    const active = () => !disposed && !contextLost && visible && !document.hidden && host.dataset.paused !== "true";
    const draw = () => {
      if (!renderer || disposed || contextLost) return;
      compose();
      renderer.render(scene, camera);
    };
    const animate = (now: number) => {
      frame = 0;
      if (!active()) return;
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      elapsed += delta;
      const ease = 1 - Math.exp(-delta * 5);
      scroll += (scrollTarget - scroll) * ease;
      pointerX += (pointerTargetX - pointerX) * ease;
      pointerY += (pointerTargetY - pointerY) * ease;
      draw();
      if (!reduceMotion.matches) frame = requestAnimationFrame(animate);
    };
    const wake = () => {
      if (!active() || frame) return;
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    };
    const syncActivity = () => {
      if (active()) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    };
    const updateScroll = () => {
      const hero = host.closest<HTMLElement>(".cinematic-hero");
      if (hero) scrollTarget = THREE.MathUtils.clamp(-hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1), 0, 1);
      wake();
    };
    const resize = () => {
      const width = Math.max(1, canvas.clientWidth || host.clientWidth);
      const height = Math.max(1, canvas.clientHeight || host.clientHeight);
      const aspect = width / height;
      const viewHeight = Math.max(totalHeight + 3.2, (panelWidth + 3.6) / aspect);
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer!.setSize(width, height, false);
      draw();
      wake();
    };
    const movePointer = (event: PointerEvent) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const bounds = host.getBoundingClientRect();
      pointerTargetX = THREE.MathUtils.clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1, -1, 1);
      pointerTargetY = THREE.MathUtils.clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1, -1, 1);
      wake();
    };
    const leavePointer = () => { pointerTargetX = 0; pointerTargetY = 0; };
    const motionChanged = () => {
      if (reduceMotion.matches) {
        pointerTargetX = pointerTargetY = pointerX = pointerY = 0;
        cancelAnimationFrame(frame);
        frame = 0;
        draw();
      }
      wake();
    };
    const loseContext = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      host.dataset.ribbonReady = "false";
      cancelAnimationFrame(frame);
      frame = 0;
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    document.addEventListener("visibilitychange", syncActivity);
    host.addEventListener("pointermove", movePointer, { passive: true });
    host.addEventListener("pointerleave", leavePointer);
    canvas.addEventListener("webglcontextlost", loseContext);
    reduceMotion.addEventListener("change", motionChanged);
    removeListeners.push(
      () => window.removeEventListener("scroll", updateScroll),
      () => document.removeEventListener("visibilitychange", syncActivity),
      () => host.removeEventListener("pointermove", movePointer),
      () => host.removeEventListener("pointerleave", leavePointer),
      () => canvas.removeEventListener("webglcontextlost", loseContext),
      () => reduceMotion.removeEventListener("change", motionChanged),
    );
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncActivity();
    }, { rootMargin: "80px" });
    intersectionObserver.observe(host);
    pauseObserver = new MutationObserver(syncActivity);
    pauseObserver.observe(host, { attributes: true, attributeFilter: ["data-paused"] });

    updateScroll();
    scroll = scrollTarget;
    resize();
    onReady();
    wake();
    return dispose;
  } catch (error) {
    host.dataset.ribbonReady = "false";
    dispose();
    throw error;
  }
}
