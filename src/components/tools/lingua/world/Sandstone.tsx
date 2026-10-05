import React, { useMemo } from "react";
import type { BuildingSpec } from "../packs/types";
import { Terrain, archShape } from "./Terrain";
import { Balustrade, Basin, Bench, Lamp, Planter } from "./Props";
import { Sea } from "./Sea";
import { Blob, Sign } from "./shared";
import { Ball, Box, Round, Toon, darken, lighten, mix, usePack, type V3 } from "./toon";

/** Sun-washed sandstone town: flat roofs, arched windows, balustrades and small palms. Used by the invented-language pack. */

function Facade({ spec }: { spec: BuildingSpec }) {
  const pack = usePack();
  const [px, py, pz] = spec.position;
  const [w, h, d] = spec.size;
  const wall = spec.kind === "wall";
  const glass = mix(pack.world.palette.ink, "#ffffff", 0.2);
  const arch = useMemo(() => archShape(0.7, 1.2), []);
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
          if (y > h - 1.4) continue;
          if (face === "s") out.push({ p: [t * along, y, d / 2 + 0.02], r: 0 });
          if (face === "n") out.push({ p: [t * along, y, -d / 2 - 0.02], r: Math.PI });
          if (face === "e") out.push({ p: [w / 2 + 0.02, y, t * along], r: Math.PI / 2 });
          if (face === "w") out.push({ p: [-w / 2 - 0.02, y, t * along], r: -Math.PI / 2 });
        }
      }
    };
    (spec.faces ?? ["s"]).forEach(place);
    return out;
  }, [spec, w, h, d, wall]);
  return (
    <group position={[px, py, pz]}>
      <Blob radius={Math.max(w, d) * 0.62} opacity={0.14} />
      <Box position={[0, h / 2, 0]} size={[w, h, d]} color={spec.color} />
      <Box position={[0, h + 0.12, 0]} size={[w + 0.4, 0.3, d + 0.4]} color={spec.roof} cast={false} />
      <Box position={[0, h * 0.5, 0]} size={[w + 0.1, 0.12, d + 0.1]} color={lighten(spec.color, 0.3)} cast={false} />
      {!wall && <Box position={[w * 0.18, h + 0.55, -d * 0.12]} size={[1.2, 0.7, 1.0]} color={lighten(spec.color, 0.15)} />}
      {windows.map((win, i) => (
        <group key={i} position={win.p} rotation={[0, win.r, 0]}>
          <mesh geometry={arch} position={[0, -0.6, 0]}>
            <meshBasicMaterial color={glass} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Palm({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Blob radius={0.9} />
      <Round position={[0, 0.25, 0]} radius={0.34} top={0.28} height={0.5} color="#f0c4a8" />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0.7]} position={[0, 0.6, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <coneGeometry args={[0.13, 1.1, 4]} />
            <Toon color={i % 2 ? "#8fcaa4" : "#a6d8b4"} />
          </mesh>
        </group>
      ))}
      <Ball position={[0, 0.9, 0]} radius={0.16} color="#f3dca0" />
    </group>
  );
}

/** A small arched door in the sandstone wall, used for the gate and the archive. */
function Gate({ spec }: { spec: BuildingSpec }) {
  const [px, py, pz] = spec.position;
  const [, , d] = spec.size;
  const arch = useMemo(() => archShape(2.6, 2.1), []);
  return (
    <group position={[px, py, pz + d / 2 + 0.02]}>
      <mesh geometry={arch}>
        <meshBasicMaterial color={darken(spec.color, 0.35)} />
      </mesh>
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.9, 0.02]}>
          <planeGeometry args={[0.07, 1.8]} />
          <meshBasicMaterial color={lighten(spec.roof, 0.3)} />
        </mesh>
      ))}
    </group>
  );
}

function Stall() {
  return (
    <group position={[-7.6, 0, -0.4]}>
      <Blob radius={2.2} />
      <Box position={[0, 0.5, 0]} size={[2.4, 1, 1.2]} color="#eaa88c" />
      <Box position={[0, 1.04, 0]} size={[2.6, 0.12, 1.4]} color="#fbeab8" cast={false} />
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <Round key={i} position={[x, 1.2, 0.2]} radius={0.13} top={0.17} height={0.22} color={i % 2 ? "#fff1c8" : "#9fd3c8"} segments={8} />
      ))}
      <Box position={[0, 1.9, -0.1]} size={[2.8, 0.1, 1.5]} color="#eaa88c" rotation={[0.2, 0, 0]} cast={false} />
    </group>
  );
}

function RegisterDesk() {
  return (
    <group position={[0, 1.2, -8.3]}>
      <Blob radius={2.6} />
      <Box position={[0, 0.5, 0]} size={[3.4, 1.0, 0.9]} color="#f8e0b8" />
      <Box position={[0, 1.05, 0]} size={[3.7, 0.12, 1.15]} color="#fbeab8" cast={false} />
      <Box position={[-1.2, 1.5, 0]} size={[0.8, 0.7, 0.1]} color="#eaa0a8" cast={false} />
      <Box position={[1.2, 1.5, 0]} size={[0.8, 0.7, 0.1]} color="#eaa0a8" cast={false} />
    </group>
  );
}

export function SandstoneScenery() {
  const pack = usePack();
  return (
    <>
      <Sea />
      <Terrain pattern="tiles" />
      <Balustrade from={[-13.4, 8]} to={[-2.2, 8]} color="#f9e6c0" />
      <Balustrade from={[2.2, 8]} to={[9.1, 8]} color="#f9e6c0" />
      {pack.world.buildings.map((spec, i) => (
        <React.Fragment key={i}>
          <Facade spec={spec} />
          {spec.kind === "wall" && <Gate spec={spec} />}
        </React.Fragment>
      ))}
      <Basin basin="#f0c9a0" stone="#fbeab8" water="#a9dccf" />
      <Stall />
      <RegisterDesk />
      {[
        [-9, 0, 6.8],
        [8, 0, 6.8],
        [-9.0, 0, 4.0],
        [7.6, 0, -4.2],
      ].map(([x, y, z], i) => (
        <Planter key={i} position={[x, y, z]} color="#f2cfa8" leaf="#a6d8b4" />
      ))}
      {[
        [-7, 0, 5.2],
        [7, 0, 5.2],
        [-4.6, 0, 0.8],
        [4.6, 0, -3.4],
        [-5.2, 1.2, -9.4],
        [5.4, 1.2, -9.6],
      ].map(([x, y, z], i) => (
        <Palm key={i} position={[x, y, z]} scale={0.9 + (i % 3) * 0.1} />
      ))}
      <Bench position={[-3.6, 0, 5.6]} rotationY={Math.PI} wood="#f0c9a0" leg="#e0a98a" />
      <Bench position={[3.6, 0, 5.6]} rotationY={Math.PI} wood="#f0c9a0" leg="#e0a98a" />
      {[
        [-3.4, 0, 4],
        [3.4, 0, 4],
        [-3.4, 1.2, -9.8],
        [3.4, 1.2, -9.8],
      ].map(([x, y, z], i) => (
        <Lamp key={i} position={[x, y, z]} pole="#c9a58a" />
      ))}
      {pack.world.signs.map((s, i) => (
        <Sign key={i} sign={s} />
      ))}
    </>
  );
}
