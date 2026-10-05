import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "../maruData";
import type { BuildingSpec } from "../packs/types";
import { Bench, Lamp } from "./Sandstone";
import { Sign } from "./shared";
import { Ball, Box, Gable, Round, Toon, usePack, type V3 } from "./toon";

/**
 * Nyhavn: the 17th-century harbour in Copenhagen, known for its rows of tall, narrow, brightly painted
 * gabled houses along the canal, wooden boats, cobbles, bicycles and the Dannebrog.
 * Stylised: shapes and colours follow the place, not a survey.
 */

const WHITE = "#f7f2e6";
const DANNEBROG = "#c8102e";

function House({ spec }: { spec: BuildingSpec }) {
  const [px, , pz] = spec.position;
  const [w, h, d] = spec.size;
  const dir = (spec.faces?.[0] ?? "e") === "e" ? 1 : -1;
  const rotY = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  const fx = px + dir * (w / 2);
  const trim = spec.trim ?? "#2f4858";
  const windows = useMemo(() => {
    const out: { y: number; dz: number }[] = [];
    for (let y = 2.5; y < h - 0.6; y += 1.45) for (const dz of [-d * 0.24, d * 0.24]) out.push({ y, dz });
    return out;
  }, [h, d]);
  const rise = 1.6 + ((Math.abs(pz) * 7) % 3) * 0.2;
  return (
    <group>
      <Box position={[px, h / 2, pz]} size={[w, h, d]} color={spec.color} ink={0.06} />
      <Box position={[px, 0.45, pz]} size={[w + 0.12, 0.9, d + 0.12]} color="#8c8274" ink={0.04} cast={false} />
      <Gable position={[px, h, pz]} across={d + 0.5} along={w + 0.5} rise={rise} color={spec.roof} />
      <Box position={[px - dir * w * 0.22, h + rise * 0.8, pz + d * 0.18]} size={[0.42, 1.1, 0.42]} color="#9a4a3a" ink={0.04} />
      {/* round attic window in the gable */}
      <group position={[fx + dir * 0.03, h + rise * 0.38, pz]} rotation={[0, rotY, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 14]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
        <mesh position={[0, 0.0, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 14]} />
          <meshBasicMaterial color="#1f2c3d" />
        </mesh>
      </group>
      {windows.map((win, i) => (
        <group key={i} position={[fx + dir * 0.03, win.y, pz + win.dz]} rotation={[0, rotY, 0]}>
          <mesh>
            <boxGeometry args={[0.72, 1.08, 0.07]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.54, 0.9, 0.06]} />
            <meshBasicMaterial color="#1f2c3d" />
          </mesh>
          <mesh position={[0, 0.02, 0.07]}>
            <boxGeometry args={[0.58, 0.06, 0.02]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <boxGeometry args={[0.06, 0.94, 0.02]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
        </group>
      ))}
      {/* ground floor: door, shop window and awning */}
      <group position={[fx + dir * 0.04, 0, pz]} rotation={[0, rotY, 0]}>
        <Box position={[-d * 0.2, 0.95, 0]} size={[0.8, 1.7, 0.1]} color={trim} ink={0.03} cast={false} />
        <Box position={[d * 0.2, 1.1, 0]} size={[0.95, 0.95, 0.08]} color="#1f2c3d" ink={0.03} cast={false} />
        <Box position={[d * 0.2, 1.75, 0.25]} size={[1.3, 0.1, 0.55]} color={trim} rotation={[0.35, 0, 0]} ink={0.03} />
      </group>
    </group>
  );
}

function HarbourWall({ spec }: { spec: BuildingSpec }) {
  const [px, , pz] = spec.position;
  const [w, h, d] = spec.size;
  const merlons = Math.floor(w / 1.4);
  return (
    <group>
      <Box position={[px, h / 2, pz]} size={[w, h, d]} color={spec.color} ink={0.06} />
      <Box position={[px, h + 0.1, pz]} size={[w + 0.3, 0.22, d + 0.3]} color={spec.roof} ink={0.04} />
      {Array.from({ length: merlons }, (_, i) => (
        <Box
          key={i}
          position={[px - w / 2 + (i + 0.5) * (w / merlons), h + 0.5, pz]}
          size={[0.7, 0.6, d * 0.8]}
          color={spec.color}
          ink={0.03}
          cast={false}
        />
      ))}
    </group>
  );
}

function Boat({
  position,
  hull,
  cabin = WHITE,
  rotationY = 0,
  phase = 0,
}: {
  position: V3;
  hull: string;
  cabin?: string;
  rotationY?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 1.1) * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.025;
  });
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      <Box position={[0, 0.25, 0]} size={[3.6, 0.8, 1.3]} color={hull} />
      <group position={[2.0, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Round position={[0, 0, 0]} radius={0.62} top={0.04} height={1.0} color={hull} segments={4} />
      </group>
      <Box position={[0, 0.7, 0]} size={[3.65, 0.12, 1.35]} color={WHITE} ink={0.03} cast={false} />
      <Box position={[-0.5, 1.25, 0]} size={[1.3, 0.8, 0.95]} color={cabin} />
      <Round position={[0.5, 2.3, 0]} radius={0.06} height={3.4} color="#6b4a2e" segments={6} ink={0.02} />
      <Box position={[0.5, 1.9, 0]} size={[1.4, 0.07, 0.07]} color="#6b4a2e" ink={0} />
    </group>
  );
}

function Flag({ position, wave = 0 }: { position: V3; wave?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 1.4 + wave) * 0.12;
  });
  return (
    <group position={position}>
      <Round position={[0, 3.2, 0]} radius={0.06} height={6.4} color="#d8d2c4" segments={6} ink={0.02} />
      <group ref={ref} position={[0.9, 5.6, 0]}>
        <Box position={[0, 0, 0]} size={[1.8, 1.3, 0.04]} color={DANNEBROG} ink={0.03} cast={false} />
        <Box position={[-0.3, 0, 0.03]} size={[0.28, 1.3, 0.02]} color={WHITE} ink={0} cast={false} />
        <Box position={[0, 0, 0.03]} size={[1.8, 0.28, 0.02]} color={WHITE} ink={0} cast={false} />
      </group>
    </group>
  );
}

function Bike({ position, rotationY = 0, color = "#2f4858" }: { position: V3; rotationY?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.36, 0.035, 6, 18]} />
          <meshBasicMaterial color="#1f2c3d" />
        </mesh>
      ))}
      <Box position={[0, 0.62, 0]} size={[1.0, 0.05, 0.05]} color={color} ink={0} />
      <Box position={[-0.1, 0.5, 0]} size={[0.05, 0.4, 0.05]} color={color} ink={0} rotation={[0, 0, 0.5]} />
      <Box position={[-0.38, 0.9, 0]} size={[0.3, 0.06, 0.1]} color="#1f2c3d" ink={0} />
      <Box position={[0.5, 0.88, 0]} size={[0.06, 0.06, 0.42]} color="#1f2c3d" ink={0} />
      <Box position={[0.58, 0.8, 0]} size={[0.3, 0.2, 0.34]} color="#c8523a" ink={0.02} cast={false} />
    </group>
  );
}

function Pump() {
  return (
    <group position={[0, 0, 2]}>
      <Round position={[0, 0.3, 0]} radius={1.95} top={1.8} height={0.6} color="#a99a86" segments={18} />
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.62, 24]} />
        <Toon color="#4aa3b8" />
      </mesh>
      <Round position={[0, 1.4, 0]} radius={0.3} top={0.22} height={1.9} color="#c9a227" segments={10} />
      <Round position={[0, 2.5, 0]} radius={0.38} top={0.2} height={0.34} color="#c9a227" segments={10} />
      <Box position={[0.55, 1.95, 0]} size={[1.0, 0.12, 0.14]} color="#c9a227" ink={0.03} />
      <Box position={[1.05, 1.62, 0]} size={[0.12, 0.7, 0.12]} color="#c9a227" ink={0.03} />
      <Box position={[-0.7, 2.25, 0]} size={[1.0, 0.1, 0.1]} color="#1f2c3d" rotation={[0, 0, 0.55]} ink={0.02} />
      <mesh position={[1.05, 1.0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 6]} />
        <meshBasicMaterial color="#8fd0e0" />
      </mesh>
    </group>
  );
}

function Kiosk() {
  return (
    <group position={[-6, 0, -2]}>
      <Box position={[0, 0.7, 0]} size={[2.4, 1.4, 1.2]} color={DANNEBROG} />
      <Box position={[0, 1.45, 0.05]} size={[2.6, 0.12, 1.4]} color={WHITE} ink={0.04} />
      <Box position={[0, 2.15, -0.25]} size={[2.1, 1.3, 0.8]} color={DANNEBROG} />
      <Box position={[0, 2.95, -0.25]} size={[2.4, 0.16, 1.1]} color={WHITE} ink={0.04} />
      <Box position={[0, 2.2, 0.17]} size={[1.7, 0.7, 0.06]} color="#1f2c3d" ink={0.02} cast={false} />
      {[-0.7, -0.25, 0.2, 0.65].map((x, i) => (
        <Round
          key={i}
          position={[x, 1.62, 0.2]}
          radius={0.13}
          top={0.17}
          height={0.22}
          color={i % 2 ? "#fff1d6" : "#4a7aa6"}
          segments={8}
          ink={0.025}
        />
      ))}
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.68]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.05, 6, 16]} />
          <meshBasicMaterial color="#1f2c3d" />
        </mesh>
      ))}
    </group>
  );
}

function HarbourGate() {
  return (
    <group position={[0, 0, -13.56]}>
      <Box position={[-1.7, 2.2, 0]} size={[0.9, 4.4, 0.9]} color="#b9a48a" ink={0.05} />
      <Box position={[1.7, 2.2, 0]} size={[0.9, 4.4, 0.9]} color="#b9a48a" ink={0.05} />
      <Box position={[-1.7, 4.55, 0]} size={[1.15, 0.3, 1.15]} color="#6c5d4d" ink={0.04} />
      <Box position={[1.7, 4.55, 0]} size={[1.15, 0.3, 1.15]} color="#6c5d4d" ink={0.04} />
      <Box position={[0, 3.2, -0.05]} size={[3.0, 3.6, 0.2]} color="#1f2c3d" ink={0.04} />
      {[-1.1, -0.74, -0.37, 0, 0.37, 0.74, 1.1].map((x) => (
        <Box key={x} position={[x, 1.9, 0.12]} size={[0.07, 3.8, 0.07]} color="#35566b" ink={0} />
      ))}
      <Box position={[0, 1.3, 0.14]} size={[2.9, 0.1, 0.07]} color="#35566b" ink={0} />
      <Box position={[0.0, 2.2, 0.2]} size={[0.3, 0.4, 0.12]} color="#c9a227" ink={0.03} />
    </group>
  );
}

function Cobbles() {
  const pack = usePack();
  const p = pack.world.palette;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, WORLD.quayZ / 2 - 36]} receiveShadow>
        <planeGeometry args={[90, WORLD.quayZ + 72]} />
        <Toon color={p.ground} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -4]} receiveShadow>
        <planeGeometry args={[18.6, 26]} />
        <Toon color={p.street} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 2]} receiveShadow>
        <circleGeometry args={[4.6, 40]} />
        <Toon color={p.plaza} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 7.2]} receiveShadow>
        <planeGeometry args={[40, 2.2]} />
        <Toon color={p.plaza} />
      </mesh>
    </>
  );
}

const BOAT_COLORS = ["#c8102e", "#2f4858", "#e9dfc2", "#4a7aa6", "#c8523a"];

export function NyhavnScenery() {
  const pack = usePack();
  const p = pack.world.palette;
  const far = ["#f2c14e", "#c8523a", "#4a7aa6", "#eadfc4", "#d9803f", "#82a68f"];
  return (
    <>
      <Cobbles />
      {/* the canal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 17]} receiveShadow>
        <planeGeometry args={[90, 18]} />
        <Toon color={p.water} />
      </mesh>
      <Box position={[0, -0.02, WORLD.quayZ + 0.3]} size={[90, 0.56, 0.7]} color="#8c8274" ink={0.04} cast={false} />
      {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
        <Round key={x} position={[x, 0.42, WORLD.quayZ - 0.1]} radius={0.17} top={0.14} height={0.5} color="#1f2c3d" segments={8} ink={0.03} />
      ))}
      {[-8.5, -2.5, 3.5, 9.5].map((x, i) => (
        <Boat
          key={x}
          position={[x, 0, 11.6 + (i % 2) * 1.6]}
          hull={BOAT_COLORS[i % BOAT_COLORS.length]}
          rotationY={(i % 2 ? 0.08 : -0.06) + (i === 3 ? Math.PI : 0)}
          phase={i * 1.7}
        />
      ))}
      <Boat position={[-4, 0, 15.8]} hull="#e9dfc2" cabin="#4a7aa6" rotationY={Math.PI + 0.05} phase={4} />
      {/* the far bank: the same colours across the water */}
      {[-20, -13, -6, 1, 8, 15, 22].map((x, i) => (
        <group key={x}>
          <Box position={[x, 3, 25]} size={[6.2, 6 + (i % 3), 4]} color={far[i % far.length]} ink={0.06} />
          <Gable position={[x, 6 + (i % 3), 25]} across={4.5} along={6.6} rise={1.6} color={i % 2 ? "#8a3b2c" : "#5f4b46"} rotationY={Math.PI / 2} />
        </group>
      ))}
      {pack.world.buildings.map((spec, i) => (spec.kind === "wall" ? <HarbourWall key={i} spec={spec} /> : <House key={i} spec={spec} />))}
      <Pump />
      <Kiosk />
      <HarbourGate />
      {/* guard booth: harbour office posts */}
      <Round position={[-1.9, 1.8, -8.3]} radius={0.3} height={3.6} color="#d8d2c4" segments={10} />
      <Round position={[1.9, 1.8, -8.3]} radius={0.3} height={3.6} color="#d8d2c4" segments={10} />
      <Box position={[0, 3.8, -8.3]} size={[4.5, 0.4, 0.8]} color="#d8d2c4" />
      <Box position={[0, 3.4, -8.2]} size={[3.2, 0.5, 0.05]} color={DANNEBROG} ink={0.03} cast={false} />
      <Flag position={[-6.5, 0, 7.4]} />
      <Flag position={[6.5, 0, 7.4]} wave={1.4} />
      <Flag position={[-3.4, 0, -12.5]} wave={2.2} />
      <Flag position={[3.4, 0, -12.5]} wave={0.7} />
      {[
        [-8.9, 0.6, 0],
        [-8.9, 3.9, Math.PI],
        [8.9, -0.2, Math.PI],
        [8.9, 5.0, 0],
        [-5.2, 6.4, 0.4],
      ].map(([x, z, r], i) => (
        <Bike key={i} position={[x, 0, z]} rotationY={r} color={["#2f4858", "#c8523a", "#4a7aa6", "#82a68f", "#c8102e"][i]} />
      ))}
      <Bench position={[-3.6, 0, 6.2]} rotationY={Math.PI} wood="#6b4a2e" leg="#1f2c3d" />
      <Bench position={[3.6, 0, 6.2]} rotationY={Math.PI} wood="#6b4a2e" leg="#1f2c3d" />
      <Bench position={[-3.4, 0, -5.2]} rotationY={Math.PI / 2} wood="#6b4a2e" leg="#1f2c3d" />
      {[
        [-3.4, 4],
        [3.4, 4],
        [-3.4, -9],
        [3.4, -9],
      ].map(([x, z], i) => (
        <Lamp key={i} position={[x, 0, z]} pole="#1f2c3d" globe="#fff6d8" />
      ))}
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
