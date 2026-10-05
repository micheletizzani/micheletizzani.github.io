import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD, clamp } from "./maruData";
import { buildGrid, findPath, type NavGrid } from "./maruNav";
import { ping } from "./maruAudio";
import { encounter as encounterOf, isUnlocked } from "./packs/helpers";
import type { EncounterId, LanguagePack } from "./packs/types";
import { NyhavnScenery } from "./world/Nyhavn";
import { SandstoneScenery } from "./world/Sandstone";
import { Ball, PackCtx, Round } from "./world/toon";
import { Bubble, Marker, People } from "./world/shared";

// ---------- the player, camera and movement ----------
const CAM_OFFSET = new THREE.Vector3(11.4, 16.8, 16.4);
const FOCUS_OFFSET = new THREE.Vector3(6.6, 5.4, 9.8);
export const CAMERA_YAW = Math.atan2(CAM_OFFSET.x, CAM_OFFSET.z);

/** Where the player cannot stand: the world edge, the canal, buildings, set pieces and people. */
function makeSolid(pack: LanguagePack) {
  return (x: number, z: number) => {
    if (x < WORLD.minX + 0.4 || x > WORLD.maxX - 0.4 || z < WORLD.minZ || z > WORLD.quayZ - 0.45) return true;
    for (const b of pack.world.buildings)
      if (Math.abs(x - b.position[0]) < b.size[0] / 2 + 0.45 && Math.abs(z - b.position[2]) < b.size[2] / 2 + 0.45) return true;
    if (Math.hypot(x, z - 2) < 2.4) return true; // fountain / pump
    if (Math.abs(x + 6) < 1.7 && Math.abs(z + 2) < 1.1) return true; // stall / kiosk
    for (const n of pack.world.npcs) if (Math.hypot(x - n.position[0], z - n.position[2]) < 0.65) return true;
    if (Math.abs(Math.abs(x) - 1.9) < 0.5 && Math.abs(z + 8.3) < 0.5) return true; // booth pillars
    return false;
  };
}

interface WalkerProps {
  pack: LanguagePack;
  pings: boolean;
  active: boolean;
  focus: EncounterId | null;
  destination: EncounterId | null;
  target: EncounterId | null;
  visited: EncounterId[];
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  onNearby: (id: EncounterId | null) => void;
  onArrive: (id: EncounterId, distance: number) => void;
  onPosition: (position: [number, number]) => void;
  walkRef: React.MutableRefObject<((x: number, z: number, then?: EncounterId) => void) | null>;
}

function Walker({ pack, pings, active, focus, destination, target, poseRef, onNearby, onArrive, onPosition, walkRef }: WalkerProps) {
  const { camera } = useThree();
  const solidAt = useMemo(() => makeSolid(pack), [pack]);
  const grid = useMemo<NavGrid>(() => buildGrid(WORLD.minX, WORLD.maxX, WORLD.minZ, WORLD.quayZ + 1, 0.5, solidAt), [solidAt]);
  const pingsRef = useRef(pings);
  pingsRef.current = pings;
  const body = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const pos = useRef({ x: 0, z: 6.4, heading: Math.PI, walking: 0 });
  const path = useRef<[number, number][]>([]);
  const pending = useRef<EncounterId | null>(null);
  const keys = useRef(new Set<string>());
  const zoom = useRef(1);
  const look = useRef(new THREE.Vector3(0, 0.8, 6.4));
  const lastNearby = useRef<EncounterId | null>(null);
  const lastReport = useRef<[number, number]>([0, 6.4]);
  const pingClock = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const targetRef = useRef(target);
  targetRef.current = target;
  const markerLife = useRef(0);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 30;
    cam.near = 0.5;
    cam.far = 120;
    cam.position.copy(new THREE.Vector3(0, 0, 6.4).add(CAM_OFFSET));
    cam.updateProjectionMatrix();
    const down = (event: KeyboardEvent) => {
      if (activeRef.current && !event.ctrlKey && !event.metaKey && !event.altKey) keys.current.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const wheel = (event: WheelEvent) => {
      if (activeRef.current) zoom.current = clamp(zoom.current * (event.deltaY > 0 ? 1.08 : 0.92), 0.5, 1.7);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("wheel", wheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("wheel", wheel);
    };
  }, [camera]);

  useEffect(() => {
    walkRef.current = (x, z, then) => {
      pending.current = then ?? null;
      path.current = findPath(grid, [pos.current.x, pos.current.z], [x, z]);
      const end = path.current[path.current.length - 1];
      if (end && marker.current && !then) {
        marker.current.position.set(end[0], 0.06, end[1]);
        markerLife.current = 1;
      }
    };
    return () => {
      walkRef.current = null;
    };
  }, [grid, walkRef]);

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
        if (!solidAt(p.x + mx * step, p.z)) p.x += mx * step;
        if (!solidAt(p.x, p.z + mz * step)) p.z += mz * step;
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
    // --- figure ---
    if (body.current) {
      body.current.position.set(p.x, Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.07 * p.walking, p.z);
      const target = p.heading;
      let diff = target - body.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      body.current.rotation.y += diff * Math.min(1, delta * 10);
      body.current.rotation.z = Math.sin(state.clock.elapsedTime * 9) * 0.06 * p.walking;
    }
    if (marker.current) {
      markerLife.current = Math.max(0, markerLife.current - delta * 1.2);
      const s = 0.6 + (1 - markerLife.current) * 0.6;
      marker.current.scale.set(s, s, s);
      (marker.current.material as THREE.MeshBasicMaterial).opacity = markerLife.current;
    }
    // --- camera: follow, or zoom in on what you are studying ---
    const focused = focus ? encounterOf(pack, focus) : undefined;
    const rate = 1 - Math.exp(-delta * 3.2);
    const cam = camera as THREE.PerspectiveCamera;
    let desiredPos: THREE.Vector3;
    let desiredLook: THREE.Vector3;
    let fov = 30;
    if (focused) {
      // aim below the subject so it sits in the upper half of the screen, above the journal sheet
      desiredLook = new THREE.Vector3(focused.position[0], 0.4, focused.position[2] + 1.1);
      // Encounters on the east side face west: view them from the west so the camera is not behind a building.
      const side = focused.position[0] > 4 ? -1 : 1;
      desiredPos = new THREE.Vector3(focused.position[0], 1.2, focused.position[2]).add(
        new THREE.Vector3(FOCUS_OFFSET.x * side, FOCUS_OFFSET.y, FOCUS_OFFSET.z)
      );
      fov = 32;
    } else {
      desiredLook = new THREE.Vector3(p.x, 0.8, p.z);
      desiredPos = new THREE.Vector3(p.x, 0, p.z).add(CAM_OFFSET.clone().multiplyScalar(zoom.current));
    }
    cam.position.lerp(desiredPos, rate);
    look.current.lerp(desiredLook, rate);
    cam.lookAt(look.current);
    if (Math.abs(cam.fov - fov) > 0.05) {
      cam.fov += (fov - cam.fov) * rate;
      cam.updateProjectionMatrix();
    }
    poseRef.current = { x: p.x, z: p.z, yaw: CAMERA_YAW };
    // --- nearby landmark + spatial beacon ---
    let closest: EncounterId | null = null;
    let best = 3.2;
    for (const lm of pack.encounters) {
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
      <group ref={body} position={[0, 0, 6.4]}>
        <Round position={[0, 0.85, 0]} radius={0.5} top={0.22} height={1.7} color={pack.world.palette.accent} segments={10} ink={0.045} />
        <Ball position={[0, 1.86, 0]} radius={0.3} color={pack.world.palette.accent} ink={0.045} />
        <mesh position={[0, 1.83, 0.22]}>
          <circleGeometry args={[0.17, 10]} />
          <meshBasicMaterial color="#2a0f1a" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 16]} />
          <meshBasicMaterial color="#8a4a1a" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.5, 24]} />
        <meshBasicMaterial color="#4a1626" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
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
  poseRef,
  onNearby,
  onArrive,
  onPosition,
}: MaruWorldProps) {
  const walkRef = useRef<((x: number, z: number, then?: EncounterId) => void) | null>(null);
  const select = (id: EncounterId) => {
    if (!active) return;
    const [ax, az] = encounterOf(pack, id).approach;
    walkRef.current?.(ax, az, id);
  };
  const bubbleId = focus ?? (nearby && isUnlocked(pack, nearby, visited) ? nearby : null);
  const { light, fog } = { light: pack.world.palette.light, fog: pack.world.palette.fog };
  return (
    <Canvas
      shadows
      dpr={[1, lite ? 1.5 : 1.75]}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "none" }}
      camera={{ fov: 30, position: [11.4, 16.8, 22.8] }}
    >
      <PackCtx.Provider value={pack}>
        <ambientLight color={light.ambient} intensity={1.05} />
        <hemisphereLight args={[light.hemiSky, light.hemiGround, 0.7]} />
        <directionalLight
          castShadow
          position={[-9, 17, 8]}
          intensity={2.3}
          color={light.sun}
          shadow-mapSize={lite ? [1024, 1024] : [2048, 2048]}
          shadow-camera-left={-24}
          shadow-camera-right={24}
          shadow-camera-top={24}
          shadow-camera-bottom={-24}
          shadow-camera-near={1}
          shadow-camera-far={60}
          shadow-bias={-0.0006}
        />
        <fog attach="fog" args={[fog, 38, 90]} />
        {/* clicking anywhere in the world (ground, walls, water) walks to the nearest open spot */}
        <group
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            if (active) walkRef.current?.(event.point.x, event.point.z);
          }}
        >
          {pack.world.scenery === "nyhavn" ? <NyhavnScenery /> : <SandstoneScenery />}
        </group>
        <People />
        {pack.encounters.map((e) => (
          <Marker key={e.id} id={e.id} state={visited.includes(e.id) ? "done" : e.id === target ? "next" : "locked"} onSelect={select} />
        ))}
        {bubbleId && <Bubble id={bubbleId} />}
        <Walker
          pack={pack}
          pings={pings}
          active={active}
          focus={focus}
          destination={destination}
          target={target}
          visited={visited}
          poseRef={poseRef}
          onNearby={onNearby}
          onArrive={onArrive}
          onPosition={onPosition}
          walkRef={walkRef}
        />
        {debug && <DebugProbe />}
      </PackCtx.Provider>
    </Canvas>
  );
}
