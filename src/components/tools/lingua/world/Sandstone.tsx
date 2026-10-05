import React, { useMemo } from "react";
import { WORLD } from "../maruData";
import type { BuildingSpec } from "../packs/types";
import { Ball, Box, Round, Toon, usePack, type V3 } from "./toon";
import { Sign } from "./shared";

/** Sunlit sandstone Copenhagen: flat roofs, arched windows, balustrades. Used by the invented-language pack. */

function Facade({ spec }: { spec: BuildingSpec }) {
  const [px, , pz] = spec.position;
  const [w, h, d] = spec.size;
  const wall = spec.kind === "wall";
  const windows = useMemo(() => {
    const out: { p: V3; r: number }[] = [];
    if (wall) return out;
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
  }, [spec, px, pz, w, h, d, wall]);
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

export function Balustrade({ from, to, color = "#f6d878" }: { from: [number, number]; to: [number, number]; color?: string }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const posts = Math.max(2, Math.round(len / 0.55));
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, -angle, 0]}>
      {Array.from({ length: posts }, (_, i) => (
        <Round key={i} position={[(i / (posts - 1)) * len, 0.42, 0]} radius={0.1} top={0.075} height={0.84} color={color} segments={8} ink={0.025} />
      ))}
      <Box position={[len / 2, 0.92, 0]} size={[len, 0.14, 0.26]} color={color} ink={0.035} />
      <Box position={[len / 2, 0.06, 0]} size={[len, 0.12, 0.3]} color={color} ink={0.03} cast={false} />
    </group>
  );
}

export function Palm({ position, scale = 1 }: { position: V3; scale?: number }) {
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

export function Bench({
  position,
  rotationY = 0,
  wood = "#c8782e",
  leg = "#8a3a2a",
}: {
  position: V3;
  rotationY?: number;
  wood?: string;
  leg?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box position={[0, 0.42, 0]} size={[1.6, 0.12, 0.5]} color={wood} ink={0.03} />
      <Box position={[-0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color={leg} ink={0.03} />
      <Box position={[0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color={leg} ink={0.03} />
    </group>
  );
}

export function Lamp({ position, pole = "#4a1626", globe = "#fff1a8" }: { position: V3; pole?: string; globe?: string }) {
  return (
    <group position={position}>
      <Round position={[0, 1.5, 0]} radius={0.07} height={3} color={pole} segments={6} ink={0} />
      <Ball position={[0, 3.1, 0]} radius={0.22} color={globe} ink={0.03} />
    </group>
  );
}

export function Fountain({ basin = "#e59b3c", stone = "#f6d878", water = "#3fb8b0" }: { basin?: string; stone?: string; water?: string }) {
  return (
    <group position={[0, 0, 2]}>
      <Round position={[0, 0.3, 0]} radius={1.95} top={1.8} height={0.6} color={basin} segments={18} />
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.62, 24]} />
        <Toon color={water} />
      </mesh>
      <Round position={[0, 1.2, 0]} radius={0.38} top={0.22} height={1.5} color={stone} segments={10} />
      <Round position={[0, 2.05, 0]} radius={0.7} top={0.3} height={0.3} color={stone} segments={12} />
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
      <Box position={[-1.2, 2.1, -0.45]} size={[0.09, 2.1, 0.09]} color="#4a1626" ink={0} />
      <Box position={[1.2, 2.1, -0.45]} size={[0.09, 2.1, 0.09]} color="#4a1626" ink={0} />
      <Box position={[0, 3.0, -0.2]} size={[2.9, 0.1, 1.5]} color="#c8452e" rotation={[0.22, 0, 0]} ink={0.04} />
      <Box position={[0, 3.04, -0.2]} size={[2.9, 0.11, 0.5]} color="#fff1a8" rotation={[0.22, 0, 0]} ink={0} cast={false} />
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
    </group>
  );
}

export function SandstoneScenery() {
  const pack = usePack();
  const p = pack.world.palette;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, WORLD.quayZ / 2 - 36]} receiveShadow>
        <planeGeometry args={[90, WORLD.quayZ + 72]} />
        <Toon color={p.ground} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -4]} receiveShadow>
        <planeGeometry args={[6.4, 26]} />
        <Toon color={p.street} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.014, -1]} receiveShadow>
        <planeGeometry args={[19, 5.4]} />
        <Toon color={p.street} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 2]} receiveShadow>
        <circleGeometry args={[4.6, 40]} />
        <Toon color={p.plaza} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 17]} receiveShadow>
        <planeGeometry args={[90, 18]} />
        <Toon color={p.water} />
      </mesh>
      <Box position={[0, 0.0, WORLD.quayZ + 0.3]} size={[90, 0.5, 0.6]} color="#f6d878" ink={0.04} cast={false} />
      <Balustrade from={[-14.8, WORLD.quayZ]} to={[-2.2, WORLD.quayZ]} />
      <Balustrade from={[2.2, WORLD.quayZ]} to={[14.8, WORLD.quayZ]} />
      {[-18, -9, 0, 9, 18].map((x, i) => (
        <Box key={x} position={[x, 2.5 + (i % 2), 26]} size={[7, 5 + (i % 2) * 2, 4]} color={i % 2 ? "#e8a548" : "#f3c552"} ink={0.06} />
      ))}
      {pack.world.buildings.map((spec, i) => (
        <Facade key={i} spec={spec} />
      ))}
      <Fountain />
      <Stall />
      <GatePiece />
      <ArchivePiece />
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
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
