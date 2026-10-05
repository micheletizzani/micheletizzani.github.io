import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { clamp } from "./maruData";
import { CAMERA, towardCamera } from "./maruCamera";
import { findPath } from "./maruNav";
import { ping } from "./maruAudio";
import { encounter as encounterOf, isUnlocked } from "./packs/helpers";
import { packGrid, packSolid } from "./packs/navgrid";
import type { EncounterId, LanguagePack } from "./packs/types";
import type { Terrain } from "./maruTerrain";
import { LOW_FURNITURE } from "./packs/visibility";
import { NyhavnScenery } from "./world/Nyhavn";
import { SandstoneScenery } from "./world/Sandstone";
import { AirportScenery } from "./world/Airport";
import { PackCtx, TerrainCtx } from "./world/toon";
import { Paul } from "./world/characters/Characters";
import type { OpeningState } from "./world/characters/Characters";
import { onSpeak } from "./maruAudio";
import { Blob, Bubble, Marker, People } from "./world/shared";

export const CAMERA_YAW = CAMERA.azimuth;
const TOWARD = new THREE.Vector3(...towardCamera());
// Screen axes of the isometric camera, in world space.
const RIGHT = new THREE.Vector3(Math.cos(CAMERA.azimuth), 0, -Math.sin(CAMERA.azimuth));
const UP = new THREE.Vector3().crossVectors(TOWARD, RIGHT).normalize();
const CAMERA_DISTANCE = 120;

/** The zoom (pixels per metre) at which everything in the world fits the screen: terraces, their sides and every roof. */
function fitView(pack: LanguagePack, terrain: Terrain, width: number, height: number) {
  const boxes: [number, number, number, number, number, number][] = pack.world.tiers.map((t) => [t.x[0], t.x[1], -2.2, t.y, t.z[0], t.z[1]]);
  for (const bd of pack.world.buildings)
    boxes.push([
      bd.position[0] - bd.size[0] / 2,
      bd.position[0] + bd.size[0] / 2,
      bd.position[1],
      bd.position[1] + bd.size[1] + 2.2,
      bd.position[2] - bd.size[2] / 2,
      bd.position[2] + bd.size[2] / 2,
    ]);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const v = new THREE.Vector3();
  for (const [x0, x1, y0, y1, z0, z1] of boxes)
    for (const x of [x0, x1])
      for (const y of [y0, y1])
        for (const z of [z0, z1]) {
          v.set(x, y, z);
          const sx = v.dot(RIGHT);
          const sy = v.dot(UP);
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
  // Keep clear of the top bar and the bottom message: the world is framed in what is left between them.
  const top = Math.min(72, height * 0.1);
  const bottom = Math.min(150, height * 0.2);
  const zoom = Math.min((width * 0.94) / (maxX - minX), ((height - top - bottom) * 0.98) / (maxY - minY));
  const shift = (bottom - top) / 2 / zoom; // metres on screen: the world centre sits this far above the screen centre
  const centre = new THREE.Vector3().addScaledVector(RIGHT, (minX + maxX) / 2).addScaledVector(UP, (minY + maxY) / 2 - shift);
  return { zoom, centre };
}

interface WalkerProps {
  pack: LanguagePack;
  terrain: Terrain;
  pings: boolean;
  active: boolean;
  focus: EncounterId | null;
  destination: EncounterId | null;
  target: EncounterId | null;
  visited: EncounterId[];
  zoomRef: React.MutableRefObject<number>;
  scarf: { fraction: number; glyphs: readonly string[] };
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  onNearby: (id: EncounterId | null) => void;
  onArrive: (id: EncounterId, distance: number) => void;
  onPosition: (position: [number, number]) => void;
  walkRef: React.MutableRefObject<((x: number, z: number, then?: EncounterId) => void) | null>;
}

function Walker({
  pack,
  terrain,
  pings,
  active,
  focus,
  destination,
  target,
  zoomRef,
  scarf,
  poseRef,
  onNearby,
  onArrive,
  onPosition,
  walkRef,
}: WalkerProps) {
  const { camera, size } = useThree();
  const solidAt = useMemo(() => packSolid(pack, terrain), [pack, terrain]);
  const grid = useMemo(() => packGrid(pack).grid, [pack]);
  const pingsRef = useRef(pings);
  pingsRef.current = pings;
  const body = useRef<THREE.Group>(null);
  const paulPose = useRef({ heading: Math.PI, walking: 0 });
  const marker = useRef<THREE.Mesh>(null);
  const pos = useRef({ x: 0, z: 6.4, heading: Math.PI, walking: 0 });
  const path = useRef<[number, number][]>([]);
  const pending = useRef<EncounterId | null>(null);
  const keys = useRef(new Set<string>());
  const look = useRef<THREE.Vector3 | null>(null);
  const lastNearby = useRef<EncounterId | null>(null);
  const lastReport = useRef<[number, number]>([0, 6.4]);
  const pingClock = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const targetRef = useRef(target);
  targetRef.current = target;
  const markerLife = useRef(0);
  const groundAt = (x: number, z: number) => terrain.groundY(x, z) ?? 0;

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (activeRef.current && !event.ctrlKey && !event.metaKey && !event.altKey) keys.current.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const wheel = (event: WheelEvent) => {
      if (activeRef.current) zoomRef.current = clamp(zoomRef.current * (event.deltaY > 0 ? 0.92 : 1.08), 1, 2.6);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("wheel", wheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("wheel", wheel);
    };
  }, [zoomRef]);

  useEffect(() => {
    walkRef.current = (x, z, then) => {
      pending.current = then ?? null;
      path.current = findPath(grid, [pos.current.x, pos.current.z], [x, z]);
      const end = path.current[path.current.length - 1];
      if (end && marker.current && !then) {
        marker.current.position.set(end[0], groundAt(end[0], end[1]) + 0.08, end[1]);
        markerLife.current = 1;
      }
    };
    return () => {
      walkRef.current = null;
    };
  }, [grid, walkRef, terrain]);

  useEffect(() => {
    const spot = destination ? encounterOf(pack, destination).approach : null;
    if (!spot) return;
    pos.current.x = spot[0];
    pos.current.z = spot[1];
    path.current = [];
    pending.current = null;
  }, [destination]);

  useFrame((state, delta) => {
    const p = pos.current;
    // --- keyboard (screen-relative: W goes "up" the screen) ---
    const k = keys.current;
    if (activeRef.current && k.size > 0) {
      const fx = -Math.sin(CAMERA_YAW);
      const fz = -Math.cos(CAMERA_YAW);
      let mx = 0;
      let mz = 0;
      if (k.has("w") || k.has("arrowup")) ((mx += fx), (mz += fz));
      if (k.has("s") || k.has("arrowdown")) ((mx -= fx), (mz -= fz));
      if (k.has("d") || k.has("arrowright")) ((mx -= fz), (mz += fx));
      if (k.has("a") || k.has("arrowleft")) ((mx += fz), (mz -= fx));
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        path.current = [];
        pending.current = null;
        const step = (delta * 4.4) / len;
        // A step is allowed if the spot is free and the ground does not jump (a terrace wall is not a staircase).
        const canStep = (nx: number, nz: number) => {
          if (solidAt(nx, nz)) return false;
          const to = terrain.groundY(nx, nz);
          return to !== null && Math.abs(to - groundAt(p.x, p.z)) < 0.45;
        };
        if (canStep(p.x + mx * step, p.z)) p.x += mx * step;
        if (canStep(p.x, p.z + mz * step)) p.z += mz * step;
        p.heading = Math.atan2(mx, mz);
        p.walking = 1;
      }
    }
    // --- click-to-move along the path ---
    if (!activeRef.current) {
      p.walking = 0;
    } else if (path.current.length) {
      const [tx, tz] = path.current[0];
      const dx = tx - p.x;
      const dz = tz - p.z;
      const dist = Math.hypot(dx, dz);
      const step = delta * 4.6;
      if (dist <= step) {
        p.x = tx;
        p.z = tz;
        path.current.shift();
      } else {
        p.x += (dx / dist) * step;
        p.z += (dz / dist) * step;
        p.heading = Math.atan2(dx, dz);
      }
      p.walking = 1;
      if (!path.current.length && pending.current) {
        const id = pending.current;
        pending.current = null;
        const lm = encounterOf(pack, id);
        onArrive(id, Math.hypot(p.x - lm.position[0], p.z - lm.position[2]));
      }
    } else if (!k.size) {
      p.walking = 0;
    }
    const py = groundAt(p.x, p.z);
    // --- figure ---
    paulPose.current.heading = p.heading;
    paulPose.current.walking += (p.walking - paulPose.current.walking) * Math.min(1, delta * 8);
    if (body.current) {
      body.current.position.set(p.x, py + Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.07 * p.walking, p.z);
      // Paul is a flat character: he mirrors to face the way he walks (see Paul), the group does not turn.
    }
    if (marker.current) {
      markerLife.current = Math.max(0, markerLife.current - delta * 1.2);
      const s = 0.6 + (1 - markerLife.current) * 0.6;
      marker.current.scale.set(s, s, s);
      (marker.current.material as THREE.MeshBasicMaterial).opacity = markerLife.current;
    }
    // --- camera: the whole world, or the player when zoomed in, or the thing being studied ---
    const cam = camera as THREE.OrthographicCamera;
    const fit = fitView(pack, terrain, size.width, size.height);
    const focused = focus ? encounterOf(pack, focus) : undefined;
    let desiredZoom = fit.zoom * zoomRef.current;
    const desired = fit.centre.clone();
    if (focused) {
      desiredZoom = Math.max(fit.zoom * 1.5, size.height / 13);
      const subject = new THREE.Vector3(focused.position[0], focused.position[1] + 1.2, focused.position[2]);
      // aim below the subject so it sits in the upper part of the screen, above the journal sheet
      desired.copy(subject).addScaledVector(UP, -(size.height / desiredZoom) * 0.28);
    } else if (zoomRef.current > 1.03) {
      desired.set(p.x, py + 1, p.z);
    }
    const rate = 1 - Math.exp(-delta * 3.4);
    if (!look.current) look.current = desired.clone();
    look.current.lerp(desired, rate);
    cam.zoom += (desiredZoom - cam.zoom) * rate;
    cam.position.copy(look.current).addScaledVector(TOWARD, CAMERA_DISTANCE);
    cam.lookAt(look.current);
    cam.updateProjectionMatrix();
    poseRef.current = { x: p.x, z: p.z, yaw: CAMERA_YAW };
    // --- nearby landmark + spatial beacon ---
    let closest: EncounterId | null = null;
    let best = 3.2;
    for (const lm of pack.encounters) {
      if (Math.abs(lm.position[1] - py) > 1.5) continue; // another terrace: not "nearby"
      const d = Math.hypot(p.x - lm.position[0], p.z - lm.position[2]);
      if (d < best) ((best = d), (closest = lm.id));
    }
    if (closest !== lastNearby.current) {
      lastNearby.current = closest;
      onNearby(closest);
    }
    if (Math.hypot(p.x - lastReport.current[0], p.z - lastReport.current[1]) > 0.25) {
      lastReport.current = [p.x, p.z];
      onPosition([p.x, p.z]);
    }
    const goal = targetRef.current ? encounterOf(pack, targetRef.current) : undefined;
    if (goal && activeRef.current && !focus && pingsRef.current) {
      pingClock.current -= delta;
      const dx = goal.position[0] - p.x;
      const dz = goal.position[2] - p.z;
      const dist = Math.hypot(dx, dz);
      if (pingClock.current <= 0 && dist > 2.4) {
        const rx = Math.cos(CAMERA_YAW);
        const rz = -Math.sin(CAMERA_YAW);
        ping((rx * dx + rz * dz) / dist, clamp(1.15 - dist / 16, 0.12, 1), 520);
        pingClock.current = clamp(dist / 9, 0.6, 2.4);
      }
    }
  });

  return (
    <>
      <group ref={body} position={[0, 0, 6.4]} userData={{ noOcclude: true }}>
        <Blob radius={0.62} opacity={0.3} />
        <Paul pose={paulPose} scarf={scarf} />
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} userData={{ noOcclude: true }}>
        <ringGeometry args={[0.35, 0.5, 24]} />
        <meshBasicMaterial color={pack.world.palette.ink} transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

/**
 * Debug and test hooks on window.__lq: project a world point to the screen, and measure how much of the walkable
 * ground the camera really sees (ray from every ground point toward the camera: does the first solid thing hit belong
 * to something other than the ground?). Only installed with ?debug or under automation.
 */
function Hooks({ pack, terrain, poseRef }: { pack: LanguagePack; terrain: Terrain; poseRef: WalkerProps["poseRef"] }) {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    const project = (x: number, y: number, z: number) => {
      camera.updateMatrixWorld();
      const v = new THREE.Vector3(x, y, z).project(camera);
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    };
    const solid = packSolid(pack, terrain);
    const visibility = () => {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      const ray = new THREE.Raycaster();
      const dir = TOWARD.clone().negate();
      const blockers: THREE.Object3D[] = [];
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (!Array.isArray(mat) && mat.transparent) return;
        for (let n: THREE.Object3D | null = o; n; n = n.parent) if (n.userData.noOcclude) return;
        // Same rule as the validator: furniture lower than a person-plus-margin hides a strip of floor, not a place.
        if (new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).y < LOW_FURNITURE) return;
        blockers.push(o);
      });
      const b = terrain.bounds;
      let total = 0;
      const hidden: [number, number][] = [];
      for (let x = b.minX; x <= b.maxX; x += 0.5)
        for (let z = b.minZ; z <= b.maxZ; z += 0.5) {
          if (!terrain.walkable(x, z, 0.4) || solid(x, z)) continue;
          total += 1;
          const y = terrain.groundY(x, z) ?? 0;
          const origin = new THREE.Vector3(x, y, z).addScaledVector(TOWARD, 100);
          ray.set(origin, dir);
          const hit = ray.intersectObjects(blockers, false)[0];
          if (hit && hit.distance < 100 - 0.9) hidden.push([x, z]);
        }
      return { total, hidden, fraction: total ? 1 - hidden.length / total : 1 };
    };
    (window as unknown as { __lq: unknown }).__lq = {
      project,
      visibility,
      pose: () => poseRef.current,
      marker: (id: EncounterId) => {
        const e = encounterOf(pack, id);
        const owner = pack.world.npcs.find((n) => n.archetype && n.encounter === id);
        const at = owner?.position ?? e.position;
        return project(at[0], at[1] + 1.2, at[2]);
      },
      ground: (x: number, z: number) => project(x, terrain.groundY(x, z) ?? 0, z),
    };
    return () => {
      delete (window as unknown as { __lq?: unknown }).__lq;
    };
  }, [camera, gl, scene, pack, terrain, poseRef]);
  return null;
}

function DebugProbe() {
  const { gl } = useThree();
  const frames = useRef({ n: 0, t: performance.now() });
  useFrame(() => {
    frames.current.n += 1;
    const now = performance.now();
    if (now - frames.current.t < 1000) return;
    const ext = gl.getContext().getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? gl.getContext().getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
    const el = document.getElementById("maru-debug");
    if (el) el.textContent = `${frames.current.n} fps · ${renderer} · ${gl.domElement.width}×${gl.domElement.height}`;
    frames.current = { n: 0, t: now };
  });
  return null;
}

export interface MaruWorldProps {
  pack: LanguagePack;
  visited: EncounterId[];
  target: EncounterId | null;
  focus: EncounterId | null;
  nearby: EncounterId | null;
  destination: EncounterId | null;
  active: boolean;
  lite: boolean;
  debug: boolean;
  /** Spatial "ping" beacon toward the next encounter. Off by default: sound should follow the player's actions. */
  pings: boolean;
  /** Zoom relative to "the whole world fits the screen" (1). The shell's +/- buttons and the wheel change it. */
  zoomRef: React.MutableRefObject<number>;
  /** Share of each encounter's words the player has recorded (0 to 1): colour rises inside the person who gave it. */
  awakening: Record<EncounterId, number>;
  /** How much of the language has been recorded, and the written words that decorate Paul's scarf. */
  scarf: { fraction: number; glyphs: readonly string[] };
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  onNearby: (id: EncounterId | null) => void;
  /** The player walked up to an encounter they clicked (or tapped). */
  onArrive: (id: EncounterId, distance: number) => void;
  onPosition: (position: [number, number]) => void;
}

export function MaruWorld({
  pack,
  visited,
  target,
  focus,
  nearby,
  destination,
  active,
  lite,
  debug,
  pings,
  zoomRef,
  awakening,
  scarf,
  poseRef,
  onNearby,
  onArrive,
  onPosition,
}: MaruWorldProps) {
  const walkRef = useRef<((x: number, z: number, then?: EncounterId) => void) | null>(null);
  const terrain = useMemo(() => packGrid(pack).terrain, [pack]);
  // accents float round whoever is being listened to, for a couple of seconds after the player asks for a sound
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    let timer = 0;
    const off = onSpeak(() => {
      setSpeaking(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSpeaking(false), 2300);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);
  const stateOf = (id: EncounterId): OpeningState => (visited.includes(id) ? "done" : id === target ? "next" : "locked");
  const states = Object.fromEntries(pack.encounters.map((e) => [e.id, stateOf(e.id)])) as Record<EncounterId, OpeningState>;
  const select = (id: EncounterId) => {
    if (!active) return;
    const [ax, az] = encounterOf(pack, id).approach;
    walkRef.current?.(ax, az, id);
  };
  const bubbleId = focus ?? (nearby && isUnlocked(pack, nearby, visited) ? nearby : null);
  const { light } = pack.world.palette;
  const hooks = debug || (typeof navigator !== "undefined" && navigator.webdriver);
  return (
    <Canvas
      orthographic
      flat
      dpr={[1, lite ? 1.5 : 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "none" }}
      camera={{ zoom: 30, near: 0.1, far: 400, position: [0, 0, 0].map((_, i) => TOWARD.toArray()[i] * CAMERA_DISTANCE) as [number, number, number] }}
    >
      <PackCtx.Provider value={pack}>
        <TerrainCtx.Provider value={terrain}>
          {/* Flat shading: one soft ambient plus one sun gives each box its three tones (top, south face, east face). */}
          <ambientLight color={light.ambient} intensity={(pack.world.palette.ambientLevel ?? 0.5) * Math.PI} />
          <hemisphereLight args={[light.hemiSky, light.hemiGround, 0.12 * Math.PI]} />
          <directionalLight position={[3, 8.5, 5]} intensity={(pack.world.palette.sunLevel ?? 0.5) * Math.PI} color={light.sun} />
          {/* clicking anywhere in the world (ground, walls) walks to the nearest open spot */}
          <group
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              if (active) walkRef.current?.(event.point.x, event.point.z);
            }}
          >
            {pack.world.scenery === "nyhavn" ? <NyhavnScenery /> : pack.world.scenery === "airport" ? <AirportScenery /> : <SandstoneScenery />}
          </group>
          <People states={states} awakening={awakening} speaking={speaking} focus={focus} />
          {pack.encounters.map((e) => {
            const owner = pack.world.npcs.find((n) => n.archetype && n.encounter === e.id);
            return <Marker key={e.id} id={e.id} state={stateOf(e.id)} onSelect={select} hidden={!!owner} at={owner?.position} />;
          })}
          {bubbleId && <Bubble id={bubbleId} />}
          <Walker
            pack={pack}
            terrain={terrain}
            pings={pings}
            active={active}
            focus={focus}
            destination={destination}
            target={target}
            visited={visited}
            zoomRef={zoomRef}
            scarf={scarf}
            poseRef={poseRef}
            onNearby={onNearby}
            onArrive={onArrive}
            onPosition={onPosition}
            walkRef={walkRef}
          />
          {hooks && <Hooks pack={pack} terrain={terrain} poseRef={poseRef} />}
          {debug && <DebugProbe />}
        </TerrainCtx.Provider>
      </PackCtx.Provider>
    </Canvas>
  );
}
