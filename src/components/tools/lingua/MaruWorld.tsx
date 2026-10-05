import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { APPROACH, BUILDINGS, LANDMARKS, WORLD, clamp, type BuildingSpec, type LandmarkId } from "./maruData";
import { buildGrid, findPath, type NavGrid } from "./maruNav";
import { GlyphPhrase, reliefTexture } from "./maruGlyphs";
import { ping } from "./maruAudio";

// ---------- look: cel shading, ink outlines, warm two-tone palette ----------
const INK = "#4a1626";
const SAND = "#f3cf63";
const CLOAK = "#7a1f3d";

const toonGradient = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
})();

function Toon({ color, emissive }: { color: string; emissive?: string }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient} emissive={emissive} emissiveIntensity={emissive ? 0.9 : 0} />;
}

type V3 = [number, number, number];
const OUTLINE = <meshBasicMaterial color={INK} side={THREE.BackSide} />;

/** Box with an inverted-hull ink outline of constant thickness. */
function Box({
  position,
  size,
  color,
  rotation,
  ink = 0.05,
  cast = true,
}: {
  position: V3;
  size: V3;
  color: string;
  rotation?: V3;
  ink?: number;
  cast?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={cast} receiveShadow>
        <boxGeometry args={size} />
        <Toon color={color} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <boxGeometry args={[size[0] + ink * 2, size[1] + ink * 2, size[2] + ink * 2]} />
          {OUTLINE}
        </mesh>
      )}
    </group>
  );
}

function Round({
  position,
  radius,
  height,
  color,
  top,
  segments = 14,
  ink = 0.05,
  emissive,
}: {
  position: V3;
  radius: number;
  height: number;
  color: string;
  top?: number;
  segments?: number;
  ink?: number;
  emissive?: string;
}) {
  const topRadius = top ?? radius;
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[topRadius, radius, height, segments]} />
        <Toon color={color} emissive={emissive} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <cylinderGeometry args={[topRadius + ink, radius + ink, height + ink * 2, segments]} />
          {OUTLINE}
        </mesh>
      )}
    </group>
  );
}

function Ball({ position, radius, color, ink = 0.04 }: { position: V3; radius: number; color: string; ink?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 14, 12]} />
        <Toon color={color} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <sphereGeometry args={[radius + ink, 14, 12]} />
          {OUTLINE}
        </mesh>
      )}
    </group>
  );
}

// ---------- scenery ----------
function Facade({ spec }: { spec: BuildingSpec }) {
  const [px, , pz] = spec.position;
  const [w, h, d] = spec.size;
  const windows = useMemo(() => {
    const out: { p: V3; r: number }[] = [];
    const floors = Math.max(1, Math.floor((h - 1.2) / 1.9));
    const place = (face: "n" | "s" | "e" | "w") => {
      const along = face === "n" || face === "s" ? w : d;
      const count = Math.max(1, Math.floor(along / 1.55));
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count - 0.5;
        for (let f = 0; f < floors; f++) {
          const y = 1.9 + f * 1.8;
          if (y > h - 0.9) continue;
          if (face === "s") out.push({ p: [px + t * along, y, pz + d / 2 + 0.03], r: 0 });
          if (face === "n") out.push({ p: [px + t * along, y, pz - d / 2 - 0.03], r: Math.PI });
          if (face === "e") out.push({ p: [px + w / 2 + 0.03, y, pz + t * along], r: Math.PI / 2 });
          if (face === "w") out.push({ p: [px - w / 2 - 0.03, y, pz + t * along], r: -Math.PI / 2 });
        }
      }
    };
    (spec.faces ?? ["s"]).forEach(place);
    return out;
  }, [spec, px, pz, w, h, d]);
  return (
    <group>
      <Box position={[px, h / 2, pz]} size={[w, h, d]} color={spec.color} ink={0.06} />
      <Box position={[px, h + 0.12, pz]} size={[w + 0.35, 0.28, d + 0.35]} color="#fbe7a6" ink={0.05} />
      <Box position={[px, h - 0.12, pz]} size={[w + 0.42, 0.22, d + 0.42]} color={spec.roof} ink={0.04} />
      <Box position={[px, h * 0.55, pz]} size={[w + 0.12, 0.14, d + 0.12]} color={spec.roof} ink={0} cast={false} />
      {windows.map((win, i) => (
        <group key={i} position={win.p} rotation={[0, win.r, 0]}>
          <mesh>
            <boxGeometry args={[0.62, 0.95, 0.05]} />
            <meshBasicMaterial color="#3a1626" />
          </mesh>
          <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.05, 12]} />
            <meshBasicMaterial color="#3a1626" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.04, 1.4, 0.02]} />
            <meshBasicMaterial color="#f7dc8a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Relief({ position, rotationY = 0, text, width = 2.6 }: { position: V3; rotationY?: number; text: string; width?: number }) {
  const texture = useMemo(() => reliefTexture(text), [text]);
  const words = text.split(/[\s,.]+/).filter(Boolean).length;
  const w = width * Math.max(1, words * 0.55);
  const h = width * 0.62;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box position={[0, 0, 0]} size={[w + 0.3, h + 0.3, 0.12]} color="#c8782e" ink={0.04} cast={false} />
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[w, h]} />
        <meshToonMaterial map={texture} gradientMap={toonGradient} />
      </mesh>
    </group>
  );
}

function Balustrade({ from, to }: { from: [number, number]; to: [number, number] }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const posts = Math.max(2, Math.round(len / 0.55));
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, -angle, 0]}>
      {Array.from({ length: posts }, (_, i) => (
        <Round
          key={i}
          position={[(i / (posts - 1)) * len, 0.42, 0]}
          radius={0.1}
          top={0.075}
          height={0.84}
          color="#f6d878"
          segments={8}
          ink={0.025}
        />
      ))}
      <Box position={[len / 2, 0.92, 0]} size={[len, 0.14, 0.26]} color="#f6d878" ink={0.035} />
      <Box position={[len / 2, 0.06, 0]} size={[len, 0.12, 0.3]} color="#f6d878" ink={0.03} cast={false} />
    </group>
  );
}

function Palm({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Round position={[0, 0.3, 0]} radius={0.38} top={0.3} height={0.6} color="#c8452e" ink={0.04} />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0.55]} position={[0, 0.7, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <coneGeometry args={[0.13, 1.25, 4]} />
            <Toon color={i % 2 ? "#2f8f6b" : "#3da37c"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bench({ position, rotationY = 0 }: { position: V3; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box position={[0, 0.42, 0]} size={[1.6, 0.12, 0.5]} color="#c8782e" ink={0.03} />
      <Box position={[-0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color="#8a3a2a" ink={0.03} />
      <Box position={[0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color="#8a3a2a" ink={0.03} />
    </group>
  );
}

function Lamp({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Round position={[0, 1.5, 0]} radius={0.07} height={3} color="#4a1626" segments={6} ink={0} />
      <Ball position={[0, 3.1, 0]} radius={0.22} color="#fff1a8" ink={0.03} />
    </group>
  );
}

function Fountain() {
  return (
    <group position={[0, 0, 2]}>
      <Round position={[0, 0.3, 0]} radius={1.95} top={1.8} height={0.6} color="#e59b3c" segments={18} />
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.62, 24]} />
        <meshToonMaterial color="#3fb8b0" gradientMap={toonGradient} />
      </mesh>
      <Round position={[0, 1.2, 0]} radius={0.38} top={0.22} height={1.5} color="#f6d878" segments={10} />
      <Round position={[0, 2.05, 0]} radius={0.7} top={0.3} height={0.3} color="#f6d878" segments={12} />
      <Relief position={[0, 0.34, 1.97]} text="sua" width={1.1} />
    </group>
  );
}

function Stall() {
  return (
    <group position={[-6, 0, -2]}>
      <Box position={[0, 0.5, 0]} size={[2.4, 1, 1.1]} color="#c8452e" />
      <Box position={[0, 1.04, 0]} size={[2.6, 0.12, 1.3]} color="#f6d878" ink={0.04} />
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <Round
          key={i}
          position={[x, 1.2, 0.15]}
          radius={0.13}
          top={0.17}
          height={0.22}
          color={i % 2 ? "#fff1a8" : "#3fb8b0"}
          segments={8}
          ink={0.025}
        />
      ))}
      <Round position={[1.55, 0.14, 0.6]} radius={0.15} top={0.2} height={0.28} color="#fff1a8" segments={8} ink={0.03} />
      <Box position={[-1.2, 2.1, -0.45]} size={[0.09, 2.1, 0.09]} color={INK} ink={0} />
      <Box position={[1.2, 2.1, -0.45]} size={[0.09, 2.1, 0.09]} color={INK} ink={0} />
      <Box position={[0, 3.0, -0.2]} size={[2.9, 0.1, 1.5]} color="#c8452e" rotation={[0.22, 0, 0]} ink={0.04} />
      <Box position={[0, 3.04, -0.2]} size={[2.9, 0.11, 0.5]} color="#fff1a8" rotation={[0.22, 0, 0]} ink={0} cast={false} />
      <Relief position={[0, 0.5, 0.58]} text="kopo" width={0.9} />
    </group>
  );
}

function GatePiece() {
  return (
    <group position={[0, 0, -13.64]}>
      <Box position={[0, 1.7, 0]} size={[2.8, 3.4, 0.2]} color="#3a1626" ink={0.04} />
      <Round position={[0, 3.4, 0]} radius={1.4} height={0.2} color="#3a1626" segments={18} ink={0.04} />
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
        <Box key={x} position={[x, 1.8, 0.14]} size={[0.07, 3.6, 0.07]} color="#b33a4a" ink={0} />
      ))}
      <Box position={[0, 1.2, 0.17]} size={[2.6, 0.1, 0.07]} color="#b33a4a" ink={0} />
      <Relief position={[0, 5.0, 0.12]} text="ganu sapo" width={1.5} />
      <Round position={[-2.2, 1.2, 0.5]} radius={0.28} top={0.2} height={2.4} color="#f6d878" segments={8} />
      <Round position={[2.2, 1.2, 0.5]} radius={0.28} top={0.2} height={2.4} color="#f6d878" segments={8} />
    </group>
  );
}

function ArchivePiece() {
  return (
    <group position={[9.06, 0, -7]} rotation={[0, -Math.PI / 2, 0]}>
      <Box position={[0, 1.4, 0]} size={[1.5, 2.8, 0.14]} color="#3a1626" ink={0.04} />
      <Round position={[0, 2.8, 0]} radius={0.75} height={0.14} color="#3a1626" segments={14} ink={0.03} />
      <Box position={[0, 1.0, 0.1]} size={[0.06, 2, 0.04]} color="#f6d878" ink={0} />
      <Relief position={[0, 4.0, 0.1]} text="kiru" width={1.2} />
    </group>
  );
}

function Scenery() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, WORLD.quayZ / 2 - 36]} receiveShadow>
        <planeGeometry args={[90, WORLD.quayZ + 72]} />
        <Toon color={SAND} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -4]} receiveShadow>
        <planeGeometry args={[6.4, 26]} />
        <Toon color="#eaa94a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.014, -1]} receiveShadow>
        <planeGeometry args={[19, 5.4]} />
        <Toon color="#eaa94a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 2]} receiveShadow>
        <circleGeometry args={[4.6, 40]} />
        <Toon color="#f9e393" />
      </mesh>
      {/* canal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 17]} receiveShadow>
        <planeGeometry args={[90, 18]} />
        <Toon color="#45bdb2" />
      </mesh>
      <Box position={[0, 0.0, WORLD.quayZ + 0.3]} size={[90, 0.5, 0.6]} color="#f6d878" ink={0.04} cast={false} />
      <Balustrade from={[-14.8, WORLD.quayZ]} to={[-2.2, WORLD.quayZ]} />
      <Balustrade from={[2.2, WORLD.quayZ]} to={[14.8, WORLD.quayZ]} />
      {/* far bank */}
      {[-18, -9, 0, 9, 18].map((x, i) => (
        <Box key={x} position={[x, 2.5 + (i % 2), 26]} size={[7, 5 + (i % 2) * 2, 4]} color={i % 2 ? "#e8a548" : "#f3c552"} ink={0.06} />
      ))}
      {BUILDINGS.map((spec, i) => (
        <Facade key={i} spec={spec} />
      ))}
      <Relief position={[-7.28, 2.6, 6]} rotationY={Math.PI / 2} text="sua" width={1.8} />
      <Relief position={[8.28, 3.2, 3.2]} rotationY={-Math.PI / 2} text="mi eno kiru" width={1.5} />
      <Fountain />
      <Stall />
      <GatePiece />
      <ArchivePiece />
      {/* guard booth */}
      <Round position={[-1.9, 1.8, -8.3]} radius={0.3} height={3.6} color="#f6d878" segments={10} />
      <Round position={[1.9, 1.8, -8.3]} radius={0.3} height={3.6} color="#f6d878" segments={10} />
      <Box position={[0, 3.8, -8.3]} size={[4.5, 0.4, 0.8]} color="#f6d878" />
      <Box position={[-1.0, 2.9, -8.2]} size={[0.7, 1.6, 0.05]} color="#c8283f" ink={0.03} cast={false} />
      <Box position={[1.0, 2.9, -8.2]} size={[0.7, 1.6, 0.05]} color="#c8283f" ink={0.03} cast={false} />
      {[
        [-7, 5.4],
        [7, 5.4],
        [-4.6, 0.8],
        [4.6, -3.4],
        [-4.7, -9.4],
        [6.2, -9.6],
      ].map(([x, z], i) => (
        <Palm key={i} position={[x, 0, z]} scale={1 + (i % 3) * 0.12} />
      ))}
      <Bench position={[-3.6, 0, 5.4]} rotationY={Math.PI} />
      <Bench position={[3.6, 0, 5.4]} rotationY={Math.PI} />
      <Bench position={[-3.4, 0, -5.2]} rotationY={Math.PI / 2} />
      {[
        [-3.4, 4],
        [3.4, 4],
        [-3.4, -9],
        [3.4, -9],
      ].map(([x, z], i) => (
        <Lamp key={i} position={[x, 0, z]} />
      ))}
    </>
  );
}

// ---------- people ----------
function Figure({
  position,
  color = CLOAK,
  scale = 1,
  facing = 0,
  key_,
  spear,
  idle = true,
}: {
  position: V3;
  color?: string;
  scale?: number;
  facing?: number;
  key_?: boolean;
  spear?: boolean;
  idle?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * 6, []);
  useFrame((s) => {
    if (ref.current && idle) ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 1.6 + phase) * 0.025;
  });
  return (
    <group ref={ref} position={position} rotation={[0, facing, 0]} scale={scale}>
      <Round position={[0, 0.8, 0]} radius={0.5} top={0.2} height={1.6} color={color} segments={10} ink={0.04} />
      <Ball position={[0, 1.78, 0]} radius={0.27} color={color} ink={0.04} />
      <mesh position={[0, 1.75, 0.2]}>
        <circleGeometry args={[0.15, 10]} />
        <meshBasicMaterial color="#2a0f1a" />
      </mesh>
      {key_ && <Round position={[0.5, 1.35, 0.25]} radius={0.06} height={0.5} color="#f6d878" segments={6} ink={0.02} />}
      {spear && <Round position={[0.6, 1.5, 0]} radius={0.04} height={3} color="#f6d878" segments={5} ink={0.02} />}
    </group>
  );
}

function People() {
  return (
    <>
      <Figure position={[1.4, 0, 3.1]} color="#c8452e" scale={0.7} facing={-0.6} />
      <Figure position={[-6, 0, -3.15]} color="#2f6f8f" facing={0} />
      <Figure position={[0, 0, -6.7]} color="#8a1c33" scale={1.12} facing={0} key_ spear />
      <Figure position={[-1.9, 0, -5.7]} color="#6b4a7a" facing={0.9} />
      <Figure position={[8.2, 0, -7]} color="#2a5f56" facing={-Math.PI / 2} />
    </>
  );
}

// ---------- markers & speech ----------
function Marker({ id, state, onSelect }: { id: LandmarkId; state: "next" | "done" | "locked"; onSelect: (id: LandmarkId) => void }) {
  const landmark = LANDMARKS.find((l) => l.id === id)!;
  const ring = useRef<THREE.Mesh>(null);
  const gem = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ring.current) {
      const k = state === "next" ? 1 + ((t * 0.9) % 1) * 0.5 : 1;
      ring.current.scale.set(k, k, k);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = state === "next" ? 0.95 - ((t * 0.9) % 1) * 0.8 : 0.6;
    }
    if (gem.current) {
      gem.current.position.y = 3.5 + Math.sin(t * 2) * 0.12;
      gem.current.rotation.y = t * 1.4;
    }
  });
  const color = state === "next" ? "#ffd23f" : state === "done" ? "#2fa59a" : "#a58d83";
  const [x, , z] = landmark.position;
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.35, 1.6, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={gem} position={[0, 3.5, 0]}>
        <octahedronGeometry args={[state === "next" ? 0.32 : 0.2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* generous invisible hit area: this is what you click */}
      <mesh
        position={[0, 2.1, 0]}
        onClick={(event: ThreeEvent<MouseEvent>) => (event.stopPropagation(), onSelect(id))}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <cylinderGeometry args={[2.2, 2.2, 4.2, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Bubble({ id }: { id: LandmarkId }) {
  const landmark = LANDMARKS.find((l) => l.id === id)!;
  const text = landmark.drills[0];
  const [x, , z] = landmark.position;
  const lift = id === "fountain" ? 3.2 : id === "gate" ? 4.4 : 3.1;
  return (
    <Html position={[x, lift, z]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="relative -translate-y-6 rounded-full border-2 border-[#4a1626] bg-[#fff8e4] px-4 py-2 text-[#4a1626] shadow-[3px_3px_0_#4a1626]"
        style={{ minWidth: 56 }}
      >
        {text ? <GlyphPhrase text={text} size={30} color="#4a1626" /> : <span className="font-serif text-2xl tracking-[.3em]">…</span>}
        <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#4a1626] bg-[#fff8e4]" />
      </div>
    </Html>
  );
}

// ---------- the player, camera and movement ----------
const CAM_OFFSET = new THREE.Vector3(11.4, 16.8, 16.4);
const FOCUS_OFFSET = new THREE.Vector3(6.6, 5.4, 9.8);
export const CAMERA_YAW = Math.atan2(CAM_OFFSET.x, CAM_OFFSET.z);

function solidAt(x: number, z: number) {
  if (x < WORLD.minX + 0.4 || x > WORLD.maxX - 0.4 || z < WORLD.minZ || z > WORLD.quayZ - 0.45) return true;
  for (const b of BUILDINGS)
    if (Math.abs(x - b.position[0]) < b.size[0] / 2 + 0.45 && Math.abs(z - b.position[2]) < b.size[2] / 2 + 0.45) return true;
  if (Math.hypot(x, z - 2) < 2.4) return true; // fountain
  if (Math.abs(x + 6) < 1.7 && Math.abs(z + 2) < 1.1) return true; // market stall
  if (Math.hypot(x - 0, z + 6.7) < 0.7 || Math.hypot(x + 6, z + 3.15) < 0.6 || Math.hypot(x + 1.9, z + 5.7) < 0.6 || Math.hypot(x - 8.2, z + 7) < 0.6)
    return true; // people
  if (Math.abs(Math.abs(x) - 1.9) < 0.5 && Math.abs(z + 8.3) < 0.5) return true; // booth pillars
  return false;
}

interface WalkerProps {
  active: boolean;
  focus: LandmarkId | null;
  destination: LandmarkId | null;
  target: LandmarkId | null;
  visited: LandmarkId[];
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  onNearby: (id: LandmarkId | null) => void;
  onArrive: (id: LandmarkId, distance: number) => void;
  onPosition: (position: [number, number]) => void;
  walkRef: React.MutableRefObject<((x: number, z: number, then?: LandmarkId) => void) | null>;
}

function Walker({ active, focus, destination, target, poseRef, onNearby, onArrive, onPosition, walkRef }: WalkerProps) {
  const { camera } = useThree();
  const grid = useMemo<NavGrid>(() => buildGrid(WORLD.minX, WORLD.maxX, WORLD.minZ, WORLD.quayZ + 1, 0.5, solidAt), []);
  const body = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const pos = useRef({ x: 0, z: 6.4, heading: Math.PI, walking: 0 });
  const path = useRef<[number, number][]>([]);
  const pending = useRef<LandmarkId | null>(null);
  const keys = useRef(new Set<string>());
  const zoom = useRef(1);
  const look = useRef(new THREE.Vector3(0, 0.8, 6.4));
  const lastNearby = useRef<LandmarkId | null>(null);
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
    const spot = destination ? APPROACH[destination] : null;
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
        const lm = LANDMARKS.find((l) => l.id === id)!;
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
    const focused = focus ? LANDMARKS.find((l) => l.id === focus) : undefined;
    const rate = 1 - Math.exp(-delta * 3.2);
    const cam = camera as THREE.PerspectiveCamera;
    let desiredPos: THREE.Vector3;
    let desiredLook: THREE.Vector3;
    let fov = 30;
    if (focused) {
      // aim below the subject so it sits in the upper half of the screen, above the journal sheet
      desiredLook = new THREE.Vector3(focused.position[0], 0.4, focused.position[2] + 1.1);
      desiredPos = new THREE.Vector3(focused.position[0], 1.2, focused.position[2]).add(FOCUS_OFFSET);
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
    let closest: LandmarkId | null = null;
    let best = 3.2;
    for (const lm of LANDMARKS) {
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
    const goal = LANDMARKS.find((l) => l.id === targetRef.current);
    if (goal && activeRef.current && !focus) {
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
        <Round position={[0, 0.85, 0]} radius={0.5} top={0.22} height={1.7} color="#b3263f" segments={10} ink={0.045} />
        <Ball position={[0, 1.86, 0]} radius={0.3} color="#b3263f" ink={0.045} />
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
  visited: LandmarkId[];
  target: LandmarkId | null;
  focus: LandmarkId | null;
  nearby: LandmarkId | null;
  destination: LandmarkId | null;
  active: boolean;
  lite: boolean;
  debug: boolean;
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  onNearby: (id: LandmarkId | null) => void;
  /** The player walked up to a landmark they clicked (or tapped). */
  onArrive: (id: LandmarkId, distance: number) => void;
  onPosition: (position: [number, number]) => void;
}

export function MaruWorld({
  visited,
  target,
  focus,
  nearby,
  destination,
  active,
  lite,
  debug,
  poseRef,
  onNearby,
  onArrive,
  onPosition,
}: MaruWorldProps) {
  const walkRef = useRef<((x: number, z: number, then?: LandmarkId) => void) | null>(null);
  const unlocked = (id: LandmarkId) => {
    const l = LANDMARKS.find((x) => x.id === id)!;
    return !l.requires || visited.includes(l.requires);
  };
  const select = (id: LandmarkId) => {
    if (!active) return;
    const [ax, az] = APPROACH[id];
    walkRef.current?.(ax, az, id);
  };
  const bubbleId = focus ?? (nearby && unlocked(nearby) ? nearby : null);
  return (
    <Canvas
      shadows
      dpr={[1, lite ? 1.5 : 1.75]}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "none" }}
      camera={{ fov: 30, position: [11.4, 16.8, 22.8] }}
    >
      <ambientLight color="#ffd6a0" intensity={1.05} />
      <hemisphereLight args={["#fff0b8", "#d8506a", 0.7]} />
      <directionalLight
        castShadow
        position={[-9, 17, 8]}
        intensity={2.3}
        color="#fff4d0"
        shadow-mapSize={lite ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0006}
      />
      <fog attach="fog" args={["#f6c27f", 38, 90]} />
      {/* clicking anywhere in the world (ground, walls, water) walks to the nearest open spot */}
      <group
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (active) walkRef.current?.(event.point.x, event.point.z);
        }}
      >
        <Scenery />
      </group>
      <People />
      {LANDMARKS.map((l) => (
        <Marker
          key={l.id}
          id={l.id}
          state={visited.includes(l.id) ? "done" : unlocked(l.id) ? (l.id === target ? "next" : "locked") : "locked"}
          onSelect={select}
        />
      ))}
      {bubbleId && <Bubble id={bubbleId} />}
      <Walker
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
    </Canvas>
  );
}
