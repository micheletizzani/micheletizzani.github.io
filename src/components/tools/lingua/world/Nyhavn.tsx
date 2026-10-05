import React, { useMemo } from "react";
import type { BuildingSpec } from "../packs/types";
import { Terrain, archShape } from "./Terrain";
import { Basin, Bench, Bike, Boat, Lamp, Planter } from "./Props";
import { Sea } from "./Sea";
import { Blob, Sign } from "./shared";
import { Box, Gable, Round, darken, isLit, lighten, mix, useGlow, usePack } from "./toon";

/**
 * Nyhavn: the 17th-century harbour in Copenhagen, known for its rows of tall, narrow, painted gabled houses,
 * wooden boats and cobbles. Stylised in pastel flat shapes: the colours and silhouettes follow the place.
 */

const WHITE = "#d8d0e0"; // window frames: dusk-pale
const RED = "#e58a8a"; // a pastel Dannebrog red

function House({ spec }: { spec: BuildingSpec }) {
  const pack = usePack();
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const dir = (spec.faces?.[0] ?? "e") === "e" ? 1 : -1;
  const rotY = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  const fx = dir * (w / 2);
  const glass = mix(pack.world.palette.ink, "#ffffff", 0.1);
  const glow = useGlow();
  const trim = spec.trim ?? lighten(spec.color, 0.5);
  const windows = useMemo(() => {
    const out: { y: number; dz: number }[] = [];
    for (let y = 2.6; y < h - 0.8; y += 1.5) for (const dz of [-d * 0.24, d * 0.24]) out.push({ y, dz });
    return out;
  }, [h, d]);
  const rise = 1.6 + ((Math.abs(pz) * 7) % 3) * 0.2;
  const door = useMemo(() => archShape(0.9, 1.9), []);
  return (
    <group position={[px, py, pz]}>
      <Blob radius={Math.max(w, d) * 0.62} opacity={0.14} />
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Gable position={[0, h, 0]} across={d + 0.4} along={w + 0.4} rise={rise} color={spec.roof} />
      {/* stepped-free gable end: a round attic window and a cornice line */}
      <Box position={[0, h - 0.05, 0]} size={[w + 0.14, 0.14, d + 0.14]} color={trim} cast={false} />
      <group position={[fx + dir * 0.02, h + rise * 0.36, 0]} rotation={[0, rotY, 0]}>
        <mesh>
          <circleGeometry args={[0.32, 18]} />
          <meshBasicMaterial color={WHITE} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.2, 18]} />
          <meshBasicMaterial color={glow} />
        </mesh>
      </group>
      {windows.map((win, i) => (
        <group key={i} position={[fx + dir * 0.02, win.y, win.dz]} rotation={[0, rotY, 0]}>
          <mesh>
            <planeGeometry args={[0.74, 1.1]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.54, 0.9]} />
            <meshBasicMaterial color={isLit(i + Math.round(pz * 3)) ? glow : glass} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.06, 0.9]} />
            <meshBasicMaterial color={WHITE} />
          </mesh>
        </group>
      ))}
      {/* ground floor: an arched door and a shop window with an awning */}
      <group position={[fx + dir * 0.02, 0, 0]} rotation={[0, rotY, 0]}>
        <mesh geometry={door} position={[-d * 0.2, 0, 0]}>
          <meshBasicMaterial color={darken(spec.color, 0.3)} />
        </mesh>
        <mesh position={[d * 0.2, 1.0, 0.01]}>
          <planeGeometry args={[1.0, 0.9]} />
          <meshBasicMaterial color={glow} />
        </mesh>
        <Box
          position={[d * 0.2, 1.7, 0.3]}
          size={[1.3, 0.1, 0.6]}
          color={spec.trim ?? lighten(spec.roof, 0.3)}
          rotation={[0.35, 0, 0]}
          cast={false}
        />
      </group>
    </group>
  );
}

/** The back wall of the upper terrace, with the harbour gate set into it. */
function GateWall({ spec }: { spec: BuildingSpec }) {
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const arch = useMemo(() => archShape(2.6, 2.1), []);
  const front = d / 2 + 0.02;
  return (
    <group position={[px, py, pz]}>
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.12, 0]} size={[w + 0.3, 0.26, d + 0.3]} color={spec.roof} cast={false} />
      {Array.from({ length: Math.floor(w / 1.6) }, (_, i) => (
        <Box
          key={i}
          position={[-w / 2 + (i + 0.5) * (w / Math.floor(w / 1.6)), h + 0.5, 0]}
          size={[0.8, 0.5, d * 0.6]}
          color={spec.color}
          cast={false}
        />
      ))}
      <group position={[0, 0, front]}>
        <mesh geometry={arch}>
          <meshBasicMaterial color={darken(spec.color, 0.35)} />
        </mesh>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.9, 0.02]}>
            <planeGeometry args={[0.07, 1.8]} />
            <meshBasicMaterial color={lighten(spec.roof, 0.35)} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0.02]}>
          <planeGeometry args={[2.3, 0.08]} />
          <meshBasicMaterial color={lighten(spec.roof, 0.35)} />
        </mesh>
        {/* a flagged banner on each side of the gate */}
        {[-3.2, 3.2].map((x) => (
          <group key={x} position={[x, 3.0, 0.02]}>
            <Box position={[0, 0, 0]} size={[0.9, 1.6, 0.04]} color={WHITE} cast={false} />
            <Box position={[-0.15, 0, 0.03]} size={[0.16, 1.6, 0.02]} color={RED} cast={false} />
            <Box position={[0, 0, 0.03]} size={[0.9, 0.16, 0.02]} color={RED} cast={false} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** The harbour master's counter on the middle terrace: low, striped, in front of the stairs. */
function GuardPost() {
  return (
    <group position={[0, 1.2, -8.3]}>
      <Blob radius={2.6} />
      <Box position={[0, 0.5, 0]} size={[3.4, 1.0, 0.9]} color="#f8e2d5" />
      <Box position={[0, 1.05, 0]} size={[3.7, 0.12, 1.15]} color={WHITE} cast={false} />
      <Box position={[-1.2, 1.5, 0.0]} size={[0.8, 0.7, 0.1]} color={RED} cast={false} />
      <Box position={[1.2, 1.5, 0.0]} size={[0.8, 0.7, 0.1]} color={RED} cast={false} />
    </group>
  );
}

/** The kiosk (a hot-dog stand, "pølsevogn"): low and red-and-cream. */
function Kiosk() {
  return (
    <group position={[-7.6, 0, -0.4]}>
      <Blob radius={2.2} />
      <Box position={[0, 0.5, 0]} size={[2.4, 1.0, 1.2]} color="#eaa0a0" />
      <Box position={[0, 1.05, 0]} size={[2.6, 0.12, 1.4]} color={WHITE} cast={false} />
      <Box position={[0, 1.55, -0.2]} size={[2.1, 0.8, 0.7]} color="#eaa0a0" />
      <Box position={[0, 1.95, -0.2]} size={[2.4, 0.1, 0.9]} color={WHITE} cast={false} />
      {[-0.7, -0.25, 0.2, 0.65].map((x, i) => (
        <Round key={i} position={[x, 1.22, 0.3]} radius={0.12} top={0.15} height={0.2} color={i % 2 ? "#fff1d6" : "#a9c8e4"} segments={8} />
      ))}
    </group>
  );
}

const BOAT_COLORS = ["#e58a8a", "#8fb0cf", "#f4e6c4", "#9fcbbd", "#f0b98d"];
const TINTS = ["#f5d891", "#eaa5a0", "#a9c8e4", "#f4e8cb", "#f0c19a", "#a9d3c0"];

export function NyhavnScenery() {
  const pack = usePack();
  return (
    <>
      <Sea />
      <Terrain pattern="cobble" />
      {/* boats moored below the quay */}
      {[-8.5, -2.5, 3.5, 7.5].map((x, i) => (
        <Boat
          key={x}
          position={[x, -3.9, 11.2 + (i % 2) * 1.8]}
          hull={BOAT_COLORS[i % BOAT_COLORS.length]}
          rotationY={(i % 2 ? 0.08 : -0.06) + (i === 3 ? Math.PI : 0)}
          phase={i * 1.7}
        />
      ))}
      {pack.world.buildings.map((spec, i) => (spec.kind === "wall" ? <GateWall key={i} spec={spec} /> : <House key={i} spec={spec} />))}
      <Basin basin="#d9c9b4" stone="#efe3d0" water="#a9d6e6" />
      <Kiosk />
      <GuardPost />
      {/* low things on the near edges only */}
      {[-9, -4.5, 4.5, 8.5].map((x, i) => (
        <Planter key={x} position={[x, 0, 7.55]} color={TINTS[(i + 1) % TINTS.length]} leaf="#b5d9b4" />
      ))}
      {[
        [-8.9, 4.6, 0.3],
        [-9.2, 6.4, -0.2],
        [-9.0, -3.4, 0.1],
      ].map(([x, z, r], i) => (
        <Bike key={i} position={[x + 1.8, 0, z]} rotationY={r + Math.PI / 2} color={["#8fb0cf", "#eaa0a0", "#9fcbbd"][i]} />
      ))}
      <Bench position={[-3.6, 0, 6.2]} rotationY={Math.PI} />
      <Bench position={[3.6, 0, 6.2]} rotationY={Math.PI} />
      <Bench position={[-3.4, 1.2, -5.0]} rotationY={Math.PI / 2} />
      {[
        [-3.4, 0, 4],
        [3.4, 0, 4],
        [-3.4, 1.2, -9.8],
        [3.4, 1.2, -9.8],
      ].map(([x, y, z], i) => (
        <Lamp key={i} position={[x, y, z]} />
      ))}
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
