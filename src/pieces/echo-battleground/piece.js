import * as THREE from "three";
import { createAudioEngine } from "./audio-engine";

export function mount(canvas, opts) {
  // The payload is an array of { point: {...} } envelopes — unwrap defensively.
  const raw = opts.data || [];
  const data = raw.map((d) => (d && d.point ? d.point : d));

  // Seeded RNG (lab §6: no bare Math.random in a shipped piece)
  let _s = (opts.seed ?? 1) >>> 0;
  const rand = () => {
    _s = (_s + 0x6d2b79f5) | 0;
    let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---- Immersion / mapping knobs (tweak live in the browser) ----
  const R0 = 1.2; // inner radius — the low-engagement core around you
  const RSPAN = 3.4; // engagement pushes points outward by up to this
  const JITTER = 0.5; // radial thickness
  const POINT_SCALE = 90; // gl_PointSize multiplier
  const DRIFT = 0.02; // idle look-around speed (rad/s)
  const FOV_MIN = 32,
    FOV_MAX = 100; // zoom range (degrees)

  // Simulated dynamics from the paper (no per-point velocity in the data):
  //  frequency ~ saturation speed P90 (Fig 4); amplitude ~ contention (Fig 5A)
  const P90 = { SIF: 32, IF: 28, N: 24, A: 14, SA: 18 };
  const rateMin = 1 / 32,
    rateMax = 1 / 14;
  const velOf = (l) => Math.max(0, Math.min(1, (1 / (P90[l] || 24) - rateMin) / (rateMax - rateMin)));
  const CONT = { SIF: 0.595, IF: 0.533, N: 0.5, A: 0.419, SA: 0.318 };
  const tempOf = (l) => Math.max(0, Math.min(1, ((CONT[l] ?? 0.5) - 0.3) / (0.62 - 0.3)));

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 100);
  camera.position.set(0, 0, 0); // at the center of the cloud
  let yaw = 0,
    pitch = 0,
    targetFov = 70;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const N = data.length;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const tangents = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const temps = new Float32Array(N);
  const vels = new Float32Array(N);
  const phases = new Float32Array(N);
  const types = [];
  const agreements = [];

  const colorA = new THREE.Color("#b7282e");
  const colorB = new THREE.Color("#6b6f72");
  const colorC = new THREE.Color("#3d7fa6");
  const HALF_PI = Math.PI / 2;

  for (let i = 0; i < N; i++) {
    const d = data[i];
    const stance = typeof d.stance === "number" ? d.stance : d.ex || 0;
    const sent = typeof d.ey === "number" ? d.ey / 0.6 : 0;
    const eng = d.engagement || 0;

    const az = stance * Math.PI;
    const el = Math.max(-1, Math.min(1, sent)) * HALF_PI * 0.9;
    const r = R0 + eng * RSPAN + (rand() - 0.5) * JITTER;
    positions[i * 3] = r * Math.cos(el) * Math.sin(az);
    positions[i * 3 + 1] = r * Math.sin(el);
    positions[i * 3 + 2] = r * Math.cos(el) * Math.cos(az);

    const c = new THREE.Color();
    if (stance < 0) c.lerpColors(colorB, colorA, -stance);
    else c.lerpColors(colorB, colorC, stance);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    let tx = rand() * 2 - 1,
      ty = rand() * 2 - 1,
      tz = rand() * 2 - 1;
    const tl = Math.hypot(tx, ty, tz) || 1;
    tangents[i * 3] = tx / tl;
    tangents[i * 3 + 1] = ty / tl;
    tangents[i * 3 + 2] = tz / tl;

    sizes[i] = d.kind === "comment" ? 0.8 : 0.5 + eng * 4.0;
    temps[i] = tempOf(d.stanceLabel);
    vels[i] = velOf(d.stanceLabel);
    phases[i] = rand() * Math.PI * 2;

    types.push(d.kind === "comment" ? 1 : 0);
    agreements.push(d.agreement || "");
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aTan", new THREE.BufferAttribute(tangents, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aTemp", new THREE.BufferAttribute(temps, 1));
  geometry.setAttribute("aVel", new THREE.BufferAttribute(vels, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: POINT_SCALE }, uMotion: { value: 1 } },
    vertexShader: `
      uniform float uTime; uniform float uScale; uniform float uMotion;
      attribute float size; attribute vec3 color;
      attribute vec3 aTan; attribute float aTemp; attribute float aVel; attribute float aPhase;
      varying vec3 vColor; varying float vFog; varying float vTw;
      void main() {
        vColor = color;
        vec3 rest = position;
        vec3 rdir = normalize(rest);
        float t = uTime;
        float f = 0.5 + aVel * 2.0;
        float b = sin(t*f + aPhase) + 0.5*sin(t*f*2.3 + aPhase*1.7) + 0.25*sin(t*f*4.1 + aPhase*2.9);
        b *= 0.33;
        float radialDisp = aTemp * 0.9 * b;
        vec3 tang = normalize(aTan - rdir * dot(aTan, rdir));
        float bt = sin(t*f*1.7 + aPhase*3.3);
        vec3 disp = (rdir * radialDisp + tang * (aTemp*aTemp*0.8*bt)) * uMotion;
        vec4 mv = modelViewMatrix * vec4(rest + disp, 1.0);
        float depth = -mv.z;
        gl_PointSize = min(size * (uScale / depth), 30.0);
        vFog = smoothstep(2.5, 12.0, depth);
        vTw = 0.65 + 0.35 * sin(t * (2.0 + aVel * 8.0) + aPhase);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor; varying float vFog; varying float vTw;
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if (ll > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, ll);
        gl_FragColor = vec4(vColor * (1.0 - vFog) * glow * vTw, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const audio = createAudioEngine();

  // Audio samples whatever you are looking at (ray through view center).
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.5;
  const center = new THREE.Vector2(0, 0);
  const sampleAudio = () => {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObject(points);
    let aCount = 0,
      dCount = 0,
      total = 0;
    const stanceMix = [0, 0, 0, 0, 0];
    for (let k = 0; k < hits.length; k++) {
      const i = hits[k].index;
      if (i == null) continue;
      total++;
      const s = typeof data[i].stance === "number" ? data[i].stance : data[i].ex || 0;
      if (s < -0.6) stanceMix[0]++;
      else if (s < -0.2) stanceMix[1]++;
      else if (s < 0.2) stanceMix[2]++;
      else if (s < 0.6) stanceMix[3]++;
      else stanceMix[4]++;
      if (types[i] === 1) {
        if (agreements[i] === "agree") aCount++;
        else if (agreements[i] === "disagree") dCount++;
      }
    }
    let controversy = 0;
    if (aCount > 0 || dCount > 0) {
      const t = aCount + dCount,
        pA = aCount / t,
        pD = dCount / t;
      const h = (p) => (p > 0 ? -p * Math.log2(p) : 0);
      controversy = h(pA) + h(pD);
    }
    if (total > 0) for (let j = 0; j < 5; j++) stanceMix[j] /= total;
    else stanceMix[2] = 1;
    audio.update({ controversy, stanceMix });
  };

  // ---- Drag to look around (mouse + one-finger touch) ----
  let dragging = false,
    lastX = 0,
    lastY = 0;
  const LOOK = 0.004;
  const startDrag = (x, y) => {
    dragging = true;
    lastX = x;
    lastY = y;
  };
  const moveDrag = (x, y) => {
    if (!dragging) return;
    yaw += (x - lastX) * LOOK;
    pitch = Math.max(-1.3, Math.min(1.3, pitch + (y - lastY) * LOOK));
    lastX = x;
    lastY = y;
  };
  const endDrag = () => {
    dragging = false;
  };

  const onMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
  const onMouseUp = () => endDrag();
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // ---- Zoom: wheel + pinch (FOV) ----
  const clampFov = (f) => Math.max(FOV_MIN, Math.min(FOV_MAX, f));
  const onWheel = (e) => {
    e.preventDefault();
    targetFov = clampFov(targetFov + e.deltaY * 0.03);
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });

  let pinchDist = 0,
    pinchFov = 0;
  const tdist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchDist = tdist(e.touches);
      pinchFov = targetFov;
    } else if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = tdist(e.touches);
      if (d > 0) targetFov = clampFov(pinchFov * (d / pinchDist));
    } else if (e.touches.length === 1) {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = () => endDrag();
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  const resize = (width = window.innerWidth, height = window.innerHeight) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const onWindowResize = () => resize();
  window.addEventListener("resize", onWindowResize);

  let animationFrameId,
    frame = 0;
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  material.uniforms.uMotion.value = isReducedMotion ? 0 : 1;

  const originalAudioStart = audio.start;
  audio.start = () => {
    if (isReducedMotion) return;
    originalAudioStart();
  };

  const fwd = new THREE.Vector3();
  let last = performance.now();
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!isReducedMotion) {
      material.uniforms.uTime.value += dt;
      if (!dragging) yaw += DRIFT * dt; // gentle idle look-around
    }
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    // Look direction from yaw/pitch (camera stays at the center)
    fwd.set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.cos(yaw));
    camera.lookAt(fwd);

    if (frame++ % 5 === 0) sampleAudio(); // audio follows your gaze
    renderer.render(scene, camera);
  };
  animate();

  const setParams = () => {};

  const dispose = async () => {
    cancelAnimationFrame(animationFrameId);
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("resize", onWindowResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    await audio.dispose();
  };

  return { dispose, resize, setParams, seed: opts.seed, audio };
}
