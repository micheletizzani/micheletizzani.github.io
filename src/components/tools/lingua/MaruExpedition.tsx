import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BookOpen, Compass, Crosshair, Expand, Map, MapPin, MessageCircle, MousePointer2, Move, Shrink, Volume2, VolumeX, X } from "lucide-react";
import { chime, ping, setMuted, speakMaru, unlockAudio } from "./maruAudio";

type LandmarkId = "fountain" | "vendor" | "guard" | "gate" | "archive";
type Landmark = {
  id: LandmarkId;
  name: string;
  position: [number, number, number];
  mark: string;
  phase: string;
  line: string;
  spoken: string;
  discovery: string;
  requires?: LandmarkId;
};

const LANDMARKS: Landmark[] = [
  {
    id: "fountain",
    name: "Højbro Fountain",
    position: [0, 0, 2],
    mark: "sua",
    phase: "Observe",
    line: "At Højbro Plads, a child fills a cup. The same mark is carved into the fountain rim, every cup, and a public spout.",
    spoken: "sua",
    discovery: "“sua” recurs wherever people drink. Record a provisional meaning in your notebook.",
  },
  {
    id: "vendor",
    name: "Gammel Strand Market",
    position: [-6, 0, -2],
    mark: "kopo · sua",
    phase: "Connect",
    line: "At the canal market, Nera points to one cup, then a tray of many: “kopo … koponi.”",
    spoken: "kopo, koponi",
    discovery: "You hear a stable root and an added ending when there are several cups.",
    requires: "fountain",
  },
  {
    id: "guard",
    name: "Christiansborg Guard",
    position: [0, 0, -7],
    mark: "mi eno kiru",
    phase: "Hear",
    line: "The guard raises a key: “mi eno kiru.” At an empty-handed traveller he says “mi naeno kiru.”",
    spoken: "mi eno kiru. mi naeno kiru.",
    discovery: "Gesture, sound, and writing align: person · possession · key; “na–” reverses the claim.",
    requires: "vendor",
  },
  {
    id: "gate",
    name: "Slotsholmen Gate",
    position: [0, 0, -13],
    mark: "ganu sapo",
    phase: "Compose",
    line: "The barred Slotsholmen gate bears two marks. The guard points at it and says “mi eno kiru ta ganu sapo.”",
    spoken: "mi eno kiru ta ganu sapo",
    discovery: "The final phrase gives a reason. You can now reconstruct a complete idea.",
    requires: "guard",
  },
  {
    id: "archive",
    name: "Royal Archive Door",
    position: [8, 0, -7],
    mark: "…",
    phase: "Speak",
    line: "The archivist waits without translating. They need to know whether you understood the guard.",
    spoken: "",
    discovery: "You have enough evidence. Build the sentence the guard taught you, then say it aloud.",
    requires: "gate",
  },
];

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

const mapCoordinates = ([x, , z]: [number, number, number]) => ({ x: 51 + x * 2.45, y: 52 + z * 2.28 });

function CopenhagenMap({
  visited,
  playerPosition,
  onEnter,
  onSelect,
}: {
  visited: LandmarkId[];
  playerPosition: [number, number];
  onEnter: () => void;
  onSelect: (id: LandmarkId) => void;
}) {
  const player = mapCoordinates([playerPosition[0], 0, playerPosition[1]]);
  return (
    <section className="absolute inset-0 z-30 overflow-y-auto pb-24 bg-[#172420] text-[#e7e4d7]">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_350px] landscape:grid-cols-[minmax(0,1fr)_320px] landscape:items-start landscape:gap-4 landscape:py-3 lg:px-10">
        <div className="order-2 rounded-sm border border-[#d5b66b]/60 bg-[#e4dcc4] p-3 shadow-2xl lg:order-1 landscape:order-1">
          <svg
            viewBox="0 0 100 100"
            className="mx-auto block max-h-[78vh] landscape:max-h-[88vh] w-full"
            role="img"
            aria-label="Stylised map of central Copenhagen"
          >
            <rect width="100" height="100" fill="#dccfac" />
            <path d="M-6 74 C19 66 26 67 45 70 C63 73 79 68 106 75 L106 104 L-6 104Z" fill="#82afb6" />
            <path d="M62 -4 C59 21 59 35 63 50 C67 62 64 72 69 104" fill="none" stroke="#82afb6" strokeWidth="9" />
            <path d="M0 51 C19 49 33 48 55 50 C73 53 84 50 100 47" fill="none" stroke="#f1ead7" strokeWidth="8" />
            <path d="M49 4 C48 22 48 37 51 50 C54 62 52 79 50 100" fill="none" stroke="#f1ead7" strokeWidth="7" />
            <path d="M4 23 L93 26 M9 38 L92 39 M15 10 L16 91 M32 5 L34 67 M78 4 L80 66" fill="none" stroke="#f1ead7" strokeWidth="3" />
            <g fill="#b98c69" stroke="#795846" strokeWidth="0.7">
              <path d="M4 5H14V20H4Z M19 5H30V20H19Z M35 5H46V20H35Z M53 6H59V20H53Z M67 5H76V21H67Z M83 5H96V21H83Z" />
              <path d="M4 28H13V35H4Z M19 28H31V35H19Z M37 28H45V35H37Z M54 29H59V35H54Z M67 29H76V36H67Z M83 29H96V36H83Z" />
              <path d="M5 42H14V48H5Z M20 42H30V48H20Z M36 42H45V48H36Z M54 42H59V48H54Z M69 42H78V48H69Z M84 42H96V48H84Z" />
              <path d="M4 56H14V67H4Z M20 56H31V67H20Z M37 56H45V67H37Z M70 55H78V66H70Z M84 55H96V66H84Z" />
            </g>
            <path d="M60 8 L68 8 L70 28 L64 37 L57 28Z" fill="#d4b56f" stroke="#795846" strokeWidth="0.7" />
            <g fontFamily="ui-monospace, monospace" fontSize="2.6" fill="#385054" letterSpacing="0.2">
              <text x="6" y="24">
                NØRREPORT
              </text>
              <text x="4" y="54">
                INDRE BY
              </text>
              <text x="39" y="55">
                HØJBRO
              </text>
              <text x="65" y="39">
                KONGENS
              </text>
              <text x="65" y="42">
                NYTORV
              </text>
              <text x="54" y="67">
                SLOTSHOLMEN
              </text>
              <text x="71" y="72">
                NYHAVN
              </text>
              <text x="4" y="78">
                GAMMEL STRAND
              </text>
              <text x="61" y="83">
                INDERHAVN
              </text>
            </g>
            {LANDMARKS.map((landmark, index) => {
              const point = mapCoordinates(landmark.position);
              const available = !landmark.requires || visited.includes(landmark.requires);
              const seen = visited.includes(landmark.id);
              return (
                <g
                  key={landmark.id}
                  onClick={() => available && onSelect(landmark.id)}
                  className={available ? "cursor-pointer" : "cursor-not-allowed opacity-35"}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3.3"
                    fill={seen ? "#467153" : available ? "#d49345" : "#798784"}
                    stroke="#172420"
                    strokeWidth="0.8"
                  />
                  <text x={point.x} y={point.y + 0.9} textAnchor="middle" fontFamily="Georgia, serif" fontSize="2.7" fill="#fff8df">
                    {index + 1}
                  </text>
                </g>
              );
            })}
            <circle cx={player.x} cy={player.y} r="1.6" fill="#192927" stroke="#f7efcf" strokeWidth="0.7" />
            <path d="M91 92h5m-2.5-2.5v5" stroke="#385054" strokeWidth="0.8" />
            <text x="91" y="98" fontSize="2.5" fill="#385054">
              N
            </text>
          </svg>
        </div>
        <div className="order-1 lg:order-2 landscape:order-2">
          <p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#e5bd6c]">Pilot city · Copenhagen, Indre By</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#f3efe2] sm:text-5xl landscape:text-2xl">
            Start with the city, not the answer.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[#c7d0c0] [@media(max-height:480px)]:hidden">
            This is an original, navigable interpretation of Copenhagen’s historic core: Gammel Strand, Højbro Plads, Slotsholmen, Kongens Nytorv, and
            the harbour. It is a game map—not a geographic survey—but the streets, water, and landmarks determine the 3D world you will enter.
          </p>
          <button
            onClick={onEnter}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-[#e5bd6c] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#172420] hover:bg-[#f4d58b]"
          >
            <Compass size={16} /> Enter street-level Copenhagen
          </button>
          <div className="mt-4 space-y-2">
            {LANDMARKS.map((landmark, index) => {
              const available = !landmark.requires || visited.includes(landmark.requires);
              const seen = visited.includes(landmark.id);
              return (
                <button
                  key={landmark.id}
                  disabled={!available}
                  onClick={() => onSelect(landmark.id)}
                  className="flex w-full items-center gap-3 border border-white/15 bg-[#20332d] p-3 landscape:p-2 text-left transition enabled:hover:border-[#e5bd6c] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs ${seen ? "bg-[#527b5a]" : "bg-[#b7793e] text-[#172420]"}`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-serif">{landmark.name}</span>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#afbdad]">
                      {seen ? "observation recorded" : available ? `${landmark.phase} · choose destination` : "route not yet intelligible"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-[#89998c]">Or pick a marker above to set your starting destination.</p>
        </div>
      </div>
    </section>
  );
}

function Building({
  position,
  size,
  color,
  roof = "#a84835",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roof?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, size[1] + 0.55, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(size[0], size[2]) * 0.82, 1.25, 4]} />
        <meshStandardMaterial color={roof} roughness={1} />
      </mesh>
      <mesh position={[0, 1.15, size[2] / 2 + 0.015]}>
        <boxGeometry args={[0.85, 1.55, 0.05]} />
        <meshStandardMaterial color="#2c372f" />
      </mesh>
    </group>
  );
}

function Person({ color = "#3c6070" }: { color?: string }) {
  return (
    <group position={[0, 0.85, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.33, 0.45, 1.4, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#8f5b45" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.27, 0]}>
        <coneGeometry args={[0.42, 0.42, 7]} />
        <meshStandardMaterial color="#d8ae63" />
      </mesh>
    </group>
  );
}

function LandmarkObject({
  landmark,
  unlocked,
  active,
  onInteract,
}: {
  landmark: Landmark;
  unlocked: boolean;
  active: boolean;
  onInteract: () => void;
}) {
  const halo = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (halo.current) {
      halo.current.rotation.z = state.clock.elapsedTime * 0.45;
      (halo.current.material as THREE.MeshBasicMaterial).opacity = active ? 0.8 : 0.28;
    }
  });
  const [x, , z] = landmark.position;
  return (
    <group
      position={[x, 0, z]}
      onClick={(event) => {
        event.stopPropagation();
        if (unlocked) onInteract();
      }}
    >
      <mesh ref={halo} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.04, 8, 32]} />
        <meshBasicMaterial color={unlocked ? "#e5ba61" : "#5b6460"} transparent />
      </mesh>
      {landmark.id === "fountain" && (
        <>
          <mesh castShadow position={[0, 0.38, 0]}>
            <cylinderGeometry args={[1.15, 1.35, 0.6, 16]} />
            <meshStandardMaterial color="#b9b5a0" />
          </mesh>
          <mesh position={[0, 0.71, 0]}>
            <cylinderGeometry args={[0.88, 0.88, 0.025, 20]} />
            <meshStandardMaterial color="#4f93a3" emissive="#23505a" />
          </mesh>
          <mesh castShadow position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.16, 0.34, 0.85, 12]} />
            <meshStandardMaterial color="#d2c8ac" />
          </mesh>
        </>
      )}
      {landmark.id === "vendor" && (
        <>
          <mesh castShadow position={[0, 0.78, 0]}>
            <boxGeometry args={[2.2, 1.3, 1.1]} />
            <meshStandardMaterial color="#6d4430" />
          </mesh>
          <mesh castShadow position={[0, 1.6, 0]}>
            <boxGeometry args={[2.8, 0.16, 1.55]} />
            <meshStandardMaterial color="#d49a4a" />
          </mesh>
          <group position={[0, 0, 1.05]}>
            <Person color="#8a4e45" />
          </group>
        </>
      )}
      {landmark.id === "guard" && <Person color="#365868" />}
      {landmark.id === "gate" && (
        <>
          <mesh castShadow position={[0, 2.2, 0]}>
            <boxGeometry args={[4.1, 4.4, 0.28]} />
            <meshStandardMaterial color="#293933" />
          </mesh>
          <mesh position={[0, 2.2, 0.16]}>
            <boxGeometry args={[0.16, 4.2, 0.08]} />
            <meshStandardMaterial color="#c49a51" />
          </mesh>
        </>
      )}
      {landmark.id === "archive" && (
        <>
          <mesh castShadow position={[0, 1.7, 0]}>
            <boxGeometry args={[2.4, 3.4, 0.5]} />
            <meshStandardMaterial color="#b9a27c" />
          </mesh>
          <mesh castShadow position={[0, 1.2, 0.3]}>
            <boxGeometry args={[0.95, 2.3, 0.08]} />
            <meshStandardMaterial color="#34463d" />
          </mesh>
        </>
      )}
      {!unlocked && (
        <mesh position={[0, 1.9, 0]}>
          <octahedronGeometry args={[0.22]} />
          <meshStandardMaterial color="#596460" />
        </mesh>
      )}
    </group>
  );
}

const BUILDINGS: { position: [number, number, number]; size: [number, number, number]; color: string; roof: string }[] = [
  { position: [-10, 0, 6], size: [5.4, 4.1, 4.5], color: "#d48b56", roof: "#5a3d38" },
  { position: [9, 0, 6], size: [5.7, 4.8, 4.8], color: "#e0c186", roof: "#6d3d37" },
  { position: [-10, 0, -4], size: [4.8, 4.9, 5.8], color: "#9bb4ad", roof: "#3e5c5b" },
  { position: [10.7, 0, -2], size: [4.6, 5.5, 6.5], color: "#c96f54", roof: "#60413f" },
  { position: [-8.5, 0, -12], size: [6.2, 5.1, 4.5], color: "#e0d0a8", roof: "#574d47" },
  { position: [9, 0, -11], size: [5.5, 5.2, 4.5], color: "#9ab5a0", roof: "#3d5a55" },
];

function Player({
  onNearby,
  onPosition,
  destination,
  active,
  joy,
  poseRef,
  target,
  lite,
}: {
  onNearby: (id: LandmarkId | null) => void;
  onPosition: (position: [number, number]) => void;
  destination: LandmarkId | null;
  active: boolean;
  joy: React.MutableRefObject<{ x: number; y: number }>;
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  target: LandmarkId | null;
  lite: boolean;
}) {
  const targetRef = useRef(target);
  targetRef.current = target;
  const pingClock = useRef(0);
  const { camera, gl } = useThree();
  const look = useRef({ yaw: 0, pitch: 0 });
  const activeRef = useRef(active);
  activeRef.current = active;
  const pressed = useRef(new Set<string>());
  const lastNearby = useRef<LandmarkId | null>(null);
  const lastReportedPosition = useRef<[number, number]>([0, 9.5]);
  useEffect(() => {
    camera.rotation.order = "YXZ";
    const down = (event: KeyboardEvent) => {
      if (activeRef.current) pressed.current.add(event.key.toLowerCase());
    };
    const up = (event: KeyboardEvent) => pressed.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const canvas = gl.domElement;
    const turn = (dx: number, dy: number) => {
      look.current.yaw -= dx * 0.0022;
      look.current.pitch = clamp(look.current.pitch - dy * 0.0022, -1.2, 1.2);
    };
    let dragging = false;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const onDown = () => {
      if (coarse) return;
      dragging = true;
      // Pointer lock gives true mouse-look; if the browser refuses it, dragging still works.
      Promise.resolve(canvas.requestPointerLock?.() as unknown).catch(() => undefined);
    };
    const onUp = () => (dragging = false);
    const onMove = (event: MouseEvent) => {
      if (!activeRef.current) return;
      if (document.pointerLockElement === canvas || dragging) turn(event.movementX, event.movementY);
    };
    // Touch: one finger on the scene looks around (the joystick is a separate element).
    let touchId: number | null = null;
    let last = { x: 0, y: 0 };
    const tStart = (event: TouchEvent) => {
      if (touchId !== null || !activeRef.current) return;
      const t = event.changedTouches[0];
      touchId = t.identifier;
      last = { x: t.clientX, y: t.clientY };
    };
    const tMove = (event: TouchEvent) => {
      if (!activeRef.current) return;
      for (const t of Array.from(event.changedTouches)) {
        if (t.identifier !== touchId) continue;
        turn((t.clientX - last.x) * 1.4, (t.clientY - last.y) * 1.4);
        last = { x: t.clientX, y: t.clientY };
      }
    };
    const tEnd = (event: TouchEvent) => {
      for (const t of Array.from(event.changedTouches)) if (t.identifier === touchId) touchId = null;
    };
    canvas.addEventListener("touchstart", tStart, { passive: true });
    canvas.addEventListener("touchmove", tMove, { passive: true });
    canvas.addEventListener("touchend", tEnd);
    canvas.addEventListener("touchcancel", tEnd);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchstart", tStart);
      canvas.removeEventListener("touchmove", tMove);
      canvas.removeEventListener("touchend", tEnd);
      canvas.removeEventListener("touchcancel", tEnd);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [camera, gl]);
  useEffect(() => {
    if (!active) {
      pressed.current.clear();
      if (document.pointerLockElement === gl.domElement) document.exitPointerLock();
    }
  }, [active, gl]);
  useEffect(() => {
    const landmark = LANDMARKS.find((item) => item.id === destination);
    if (landmark) {
      camera.position.set(landmark.position[0], 1.65, Math.min(10.5, landmark.position[2] + 3.1));
      look.current = { yaw: 0, pitch: 0 };
    }
  }, [camera, destination]);
  useFrame((_, delta) => {
    if (pressed.current.has("arrowleft")) look.current.yaw += delta * 1.8;
    if (pressed.current.has("arrowright")) look.current.yaw -= delta * 1.8;
    camera.rotation.set(look.current.pitch, look.current.yaw, 0);
    const forward = new THREE.Vector3(-Math.sin(look.current.yaw), 0, -Math.cos(look.current.yaw));
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const movement = new THREE.Vector3();
    if (pressed.current.has("w") || pressed.current.has("arrowup")) movement.add(forward);
    if (pressed.current.has("s") || pressed.current.has("arrowdown")) movement.sub(forward);
    if (pressed.current.has("d")) movement.add(right);
    if (pressed.current.has("a")) movement.sub(right);
    let speed = 1;
    if (movement.lengthSq() === 0 && activeRef.current && (joy.current.x || joy.current.y)) {
      movement.addScaledVector(forward, -joy.current.y).addScaledVector(right, joy.current.x);
      speed = Math.min(1, movement.length());
    }
    if (movement.lengthSq() > 0) {
      const step = movement.normalize().multiplyScalar(delta * 4.4 * speed);
      const blocked = (x: number, z: number) =>
        BUILDINGS.some((b) => Math.abs(x - b.position[0]) < b.size[0] / 2 + 0.4 && Math.abs(z - b.position[2]) < b.size[2] / 2 + 0.4);
      // Slide along walls: test each axis separately.
      if (!blocked(camera.position.x + step.x, camera.position.z)) camera.position.x += step.x;
      if (!blocked(camera.position.x, camera.position.z + step.z)) camera.position.z += step.z;
    }
    camera.position.x = clamp(camera.position.x, -13.5, 13.5);
    camera.position.z = clamp(camera.position.z, -14.8, 11);
    camera.position.y = 1.65;
    let closest: LandmarkId | null = null;
    let distance = 2.25;
    LANDMARKS.forEach((landmark) => {
      const d = Math.hypot(camera.position.x - landmark.position[0], camera.position.z - landmark.position[2]);
      if (d < distance) {
        distance = d;
        closest = landmark.id;
      }
    });
    poseRef.current = { x: camera.position.x, z: camera.position.z, yaw: look.current.yaw };
    // Spatial beacon: a soft ping from the direction of the next clue; faster and louder as you close in.
    const goal = LANDMARKS.find((item) => item.id === targetRef.current);
    if (goal && activeRef.current) {
      const dx = goal.position[0] - camera.position.x;
      const dz = goal.position[2] - camera.position.z;
      const dist = Math.hypot(dx, dz);
      pingClock.current -= delta;
      if (pingClock.current <= 0 && dist > 2.4) {
        const front = (forward.x * dx + forward.z * dz) / dist;
        const side = (right.x * dx + right.z * dz) / dist;
        ping(side, clamp(1.15 - dist / 16, 0.12, 1), 480 + 280 * Math.max(0, front));
        pingClock.current = clamp(dist / 9, 0.55, 2.4);
      }
    }
    if (closest !== lastNearby.current) {
      lastNearby.current = closest;
      onNearby(closest);
    }
    if (Math.hypot(camera.position.x - lastReportedPosition.current[0], camera.position.z - lastReportedPosition.current[1]) > 0.25) {
      lastReportedPosition.current = [camera.position.x, camera.position.z];
      onPosition(lastReportedPosition.current);
    }
  });
  void lite;
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

function City({
  visited,
  nearby,
  onNearby,
  onInteract,
  destination,
  onPosition,
  active,
  joy,
  poseRef,
  target,
  lite,
  debug,
}: {
  joy: React.MutableRefObject<{ x: number; y: number }>;
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  target: LandmarkId | null;
  lite: boolean;
  debug: boolean;
  active: boolean;
  visited: LandmarkId[];
  nearby: LandmarkId | null;
  onNearby: (id: LandmarkId | null) => void;
  onInteract: (id: LandmarkId) => void;
  destination: LandmarkId | null;
  onPosition: (position: [number, number]) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, lite ? 1.5 : 1.75]}
      style={{ touchAction: "none" }}
      camera={{ position: [0, 1.65, 9.5], fov: 69 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#b6d3d0");
      }}
    >
      <fog attach="fog" args={["#b6d3d0", 17, 42]} />
      <ambientLight intensity={1.25} />
      <directionalLight castShadow position={[7, 12, 6]} intensity={2.3} shadow-mapSize={lite ? [512, 512] : [1024, 1024]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#cdbf98" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, -2]} receiveShadow>
        <planeGeometry args={[6.5, 34]} />
        <meshStandardMaterial color="#a58f73" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.014, 1]} receiveShadow>
        <planeGeometry args={[19, 5.5]} />
        <meshStandardMaterial color="#aa9679" roughness={1} />
      </mesh>
      {BUILDINGS.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      <mesh castShadow position={[0, 3.1, -14.2]}>
        <boxGeometry args={[10, 6.2, 1.2]} />
        <meshStandardMaterial color="#907b5d" />
      </mesh>
      {LANDMARKS.map((landmark) => (
        <LandmarkObject
          key={landmark.id}
          landmark={landmark}
          unlocked={!landmark.requires || visited.includes(landmark.requires)}
          active={nearby === landmark.id}
          onInteract={() => onInteract(landmark.id)}
        />
      ))}
      {debug && <DebugProbe />}
      <Player
        onNearby={onNearby}
        onPosition={onPosition}
        destination={destination}
        active={active}
        joy={joy}
        poseRef={poseRef}
        target={target}
        lite={lite}
      />
    </Canvas>
  );
}

const SENTENCE = ["mi", "eno", "kiru", "ta", "ganu", "sapo"];
const SHUFFLED = ["ganu", "kiru", "mi", "sapo", "eno", "ta"];

function SpeakPanel({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [built, setBuilt] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const add = (word: string) => {
    speakMaru(word);
    setWrong(false);
    setBuilt((old) => [...old, word]);
  };
  const say = () => {
    speakMaru(built.join(" "));
    if (built.length === SENTENCE.length && built.every((word, i) => word === SENTENCE[i])) {
      chime();
      onDone();
    } else {
      setWrong(true);
    }
  };
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#0d1514]/80 p-3">
      <div className="max-h-full w-full max-w-xl overflow-y-auto border border-[#d9b566]/60 bg-[#172420] p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e8c771]">Speak · Royal Archive</p>
            <h2 className="mt-1 font-serif text-xl sm:text-2xl">Tell the archivist what the guard told you.</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="border border-white/25 p-2 hover:bg-[#7d4036]">
            <X size={14} />
          </button>
        </div>
        <p className="mt-2 text-xs text-[#b8c3ae]">
          Tap the words in order. The sentence says: “I need the key because the gate is closed.” Check your notebook.
        </p>
        <div className={`mt-4 flex min-h-[3.2rem] flex-wrap gap-2 border p-2 ${wrong ? "border-[#c4624f]" : "border-white/20"}`}>
          {built.length === 0 && <span className="self-center text-xs text-white/40">your sentence…</span>}
          {built.map((word, i) => (
            <span key={i} className="bg-[#e2b75f] px-3 py-2 font-serif text-lg text-[#17211d]">
              {word}
            </span>
          ))}
        </div>
        {wrong && <p className="mt-2 text-xs text-[#e8a090]">That is not what the guard said. Listen again to the words, then rebuild.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {SHUFFLED.map((word) => (
            <button
              key={word}
              disabled={built.includes(word)}
              onClick={() => add(word)}
              className="flex items-center gap-2 border border-white/25 bg-[#20332d] px-4 py-3 font-serif text-lg enabled:hover:border-[#e5bd6c] disabled:opacity-30"
            >
              <Volume2 size={13} className="text-[#e8c771]" /> {word}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={say}
            disabled={!built.length}
            className="flex-1 bg-[#e5bd6c] px-4 py-3 font-mono text-xs font-bold uppercase text-[#172420] disabled:opacity-40"
          >
            Say it
          </button>
          <button onClick={() => (setBuilt([]), setWrong(false))} className="border border-white/25 px-4 py-3 font-mono text-xs uppercase">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function Joystick({ joy }: { joy: React.MutableRefObject<{ x: number; y: number }> }) {
  const base = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const set = (clientX: number, clientY: number) => {
    const rect = base.current!.getBoundingClientRect();
    const r = rect.width / 2;
    let dx = (clientX - (rect.left + r)) / r;
    let dy = (clientY - (rect.top + r)) / r;
    const len = Math.hypot(dx, dy);
    if (len > 1) ((dx /= len), (dy /= len));
    joy.current = { x: dx, y: dy };
    if (thumb.current) thumb.current.style.transform = `translate(${dx * r * 0.6}px, ${dy * r * 0.6}px)`;
  };
  const release = () => {
    joy.current = { x: 0, y: 0 };
    if (thumb.current) thumb.current.style.transform = "translate(0,0)";
  };
  return (
    <div
      ref={base}
      data-testid="joystick"
      onPointerDown={(e) => (e.currentTarget.setPointerCapture(e.pointerId), set(e.clientX, e.clientY))}
      onPointerMove={(e) => e.buttons && set(e.clientX, e.clientY)}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute bottom-4 left-4 z-20 grid h-28 w-28 touch-none place-items-center rounded-full border border-white/30 bg-[#14201d]/70"
    >
      <div ref={thumb} className="h-12 w-12 rounded-full border border-[#e8c771]/70 bg-[#e8c771]/35" />
    </div>
  );
}

function CompassHud({ poseRef, target }: { poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>; target: LandmarkId | null }) {
  const arrow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const goal = LANDMARKS.find((item) => item.id === target);
    const tick = () => {
      if (goal && arrow.current && label.current) {
        const { x, z, yaw } = poseRef.current;
        const dx = goal.position[0] - x;
        const dz = goal.position[2] - z;
        // Bearing of the goal relative to where the camera faces; 0 = straight ahead.
        const angle = Math.atan2(dx, -dz) + yaw;
        arrow.current.style.transform = `rotate(${(angle * 180) / Math.PI}deg)`;
        label.current.textContent = `${Math.round(Math.hypot(dx, dz))} m`;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [poseRef, target]);
  if (!target) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#e8c771]/50 bg-[#14201d]/85 px-3 py-1.5 [@media(max-height:480px)]:top-2 portrait:top-[4.2rem]">
      <div ref={arrow} data-testid="compass-arrow" className="text-[#e8c771]">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M9 1 L14 15 L9 12 L4 15Z" fill="currentColor" />
        </svg>
      </div>
      <span ref={label} className="font-mono text-[11px] text-[#f3efe2]" />
      <span className="max-w-[28vw] truncate font-mono text-[10px] uppercase tracking-wider text-[#e8c771]">
        {LANDMARKS.find((i) => i.id === target)?.name}
      </span>
    </div>
  );
}

export const MaruExpedition: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const shell = useRef<HTMLDivElement>(null);
  const joy = useRef({ x: 0, y: 0 });
  const poseRef = useRef({ x: 0, z: 9.5, yaw: 0 });
  const heard = useRef(new Set<LandmarkId>());
  const [visited, setVisited] = useState<LandmarkId[]>([]);
  const [nearby, setNearby] = useState<LandmarkId | null>(null);
  const [message, setMessage] = useState(
    "You are at Højbro Plads. Look around, then walk toward a gold circle. Listen: the city speaks before it explains."
  );
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [speakOpen, setSpeakOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(true);
  const [destination, setDestination] = useState<LandmarkId | null>("fountain");
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([0, 9.5]);
  const [isTouch, setIsTouch] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [debug, setDebug] = useState(false);
  const current = LANDMARKS.find((item) => item.id === nearby);
  const unlocked = !!current && (!current.requires || visited.includes(current.requires));
  const target = LANDMARKS.find((l) => !visited.includes(l.id) && (!l.requires || visited.includes(l.requires)))?.id ?? null;
  const playing = !mapOpen && !notebookOpen && !speakOpen;

  const interact = useCallback(
    (id: LandmarkId) => {
      const landmark = LANDMARKS.find((item) => item.id === id)!;
      if (landmark.requires && !visited.includes(landmark.requires)) {
        setMessage("The way is socially closed. Return when you understand more of the city.");
        return;
      }
      if (landmark.id === "archive" && !visited.includes("archive")) {
        setMessage(`${landmark.line} ${landmark.discovery}`);
        setSpeakOpen(true);
        return;
      }
      if (!visited.includes(id)) chime();
      if (landmark.spoken) speakMaru(landmark.spoken);
      setVisited((old) => (old.includes(id) ? old : [...old, id]));
      setMessage(`${landmark.line} ${landmark.discovery}`);
    },
    [visited]
  );

  // Cue: the first time you reach an intelligible place, you hear it before reading anything.
  const handleNearby = useCallback(
    (id: LandmarkId | null) => {
      setNearby(id);
      const landmark = LANDMARKS.find((item) => item.id === id);
      if (!landmark || heard.current.has(landmark.id)) return;
      if (landmark.requires && !visited.includes(landmark.requires)) return;
      heard.current.add(landmark.id);
      if (landmark.spoken) {
        speakMaru(landmark.spoken);
        setMessage(`You hear: “${landmark.spoken}” — ${isTouch ? "tap" : "press E or click"} to record it.`);
      } else {
        setMessage(landmark.line);
      }
    },
    [visited, isTouch]
  );

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(coarse);
    setDebug(window.location.search.includes("debug"));
    if (coarse) setMessage("Drag on the scene to look, use the stick to walk toward a gold circle. Landscape works best.");
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "e" && nearby && playing) interact(nearby);
      if (event.key === "Escape") (setNotebookOpen(false), setSpeakOpen(false));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nearby, interact, playing]);
  useEffect(() => {
    // Useful for a bookmarked return to the street-level view; normal launches always begin on the map.
    if (window.location.hash === "#street") setMapOpen(false);
  }, []);
  useEffect(() => setMuted(!soundOn), [soundOn]);

  const toggleFullscreen = async () => {
    const el = shell.current as (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }) | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await (el?.requestFullscreen?.() ?? el?.webkitRequestFullscreen?.());
      // Phones: landscape is the playable orientation. Only works in fullscreen, and is refused on iOS.
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (document.fullscreenElement && isTouch) await orientation.lock?.("landscape");
    } catch {
      /* fullscreen or orientation lock refused; the overlay already fills the viewport */
    }
  };
  const begin = (id?: LandmarkId) => {
    unlockAudio();
    if (id) {
      setDestination(id);
      setMessage(`Route marked for ${LANDMARKS.find((item) => item.id === id)?.name}. Follow the pings and the arrow.`);
    }
    setMapOpen(false);
    if (!document.fullscreenElement) void toggleFullscreen();
  };
  const leave = () => (onExit ? onExit() : window.location.assign("/tools/language-hub"));
  const hud = "border border-white/30 bg-[#14201ddd] text-xs hover:bg-[#29463b]";
  const tokens = current?.spoken ? Array.from(new Set(current.spoken.split(/[\s,.]+/).filter(Boolean))) : [];

  return (
    <div ref={shell} className="fixed inset-0 z-[200] overflow-hidden bg-[#10191a] text-[#f3efe2]">
      <City
        visited={visited}
        nearby={nearby}
        onNearby={handleNearby}
        onInteract={interact}
        destination={destination}
        onPosition={setPlayerPosition}
        active={playing}
        joy={joy}
        poseRef={poseRef}
        target={target}
        lite={isTouch}
        debug={debug}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,18,18,.48))]" />
      {!mapOpen && <CompassHud poseRef={poseRef} target={target} />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-5 [@media(max-height:480px)]:p-2">
        <div className="pointer-events-auto flex flex-col gap-2 [@media(max-height:480px)]:flex-row">
          <div className="pointer-events-none hidden rounded border border-[#d9b566]/50 bg-[#14201ddd] px-4 py-3 shadow-xl sm:block [@media(max-height:480px)]:hidden">
            <p className="font-serif text-xl leading-none">Maru: Copenhagen Pilot</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[.16em] text-[#e8c771]">Indre By · first-person language expedition</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMapOpen(true)} className={`${hud} flex items-center gap-2 px-3 py-2`}>
              <Map size={15} /> Map
            </button>
            <button onClick={() => setNotebookOpen((open) => !open)} className={`${hud} flex items-center gap-2 border-[#e2b75f]/60 px-3 py-2`}>
              <BookOpen size={15} /> {visited.length}/5
            </button>
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "Mute" : "Unmute"} className={`${hud} px-3 py-2`}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={toggleFullscreen} aria-label="Toggle full screen" className={`${hud} flex items-center gap-2 px-3 py-2`}>
            {isFs ? <Shrink size={15} /> : <Expand size={15} />}
            <span className="hidden sm:inline">{isFs ? "Exit full screen" : "Full screen"}</span>
          </button>
          <button onClick={leave} className={`${hud} flex items-center gap-2 px-3 py-2 hover:bg-[#7d4036]`}>
            <X size={15} /> <span className="hidden sm:inline">Back to games</span>
          </button>
        </div>
      </div>
      {isTouch && !mapOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 hidden justify-center portrait:flex">
          <p className="rounded border border-[#e8c771]/60 bg-[#14201d] px-3 py-2 text-center text-xs">
            Rotate your phone to landscape for easier navigation.
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Crosshair size={22} className="text-white/85" />
      </div>
      <div
        className={`pointer-events-none absolute bottom-3 flex items-end justify-between gap-3 ${isTouch ? "left-36 right-28 portrait:bottom-40 portrait:left-3 portrait:right-3" : "left-4 right-4 sm:left-6 sm:right-6"}`}
      >
        <div className="pointer-events-auto max-h-[38vh] max-w-2xl overflow-y-auto rounded-sm border border-white/20 bg-[#14201de8] p-3 shadow-xl sm:p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#e8c771]">
            <MessageCircle size={14} /> {current?.phase ?? "Arrive"}
          </div>
          <p className="mt-2 text-xs leading-relaxed sm:text-base">{message}</p>
          {tokens.length > 0 && unlocked && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => speakMaru(current!.spoken)}
                aria-label="Replay"
                className="flex items-center gap-1 border border-[#e8c771]/60 px-2 py-1 text-[11px] text-[#e8c771]"
              >
                <Volume2 size={13} /> hear
              </button>
              {tokens.map((word) => (
                <button key={word} onClick={() => speakMaru(word)} className="bg-[#e2b75f] px-2 py-1 font-serif text-sm text-[#17211d]">
                  {word}
                </button>
              ))}
            </div>
          )}
          {current && unlocked && !isTouch && (
            <button
              onClick={() => interact(current.id)}
              className="mt-3 inline-flex items-center gap-2 bg-[#e2b75f] px-3 py-2 font-mono text-xs font-bold text-[#17211d] hover:bg-[#f3d181]"
            >
              <span className="border border-black/25 px-1">E</span> {visited.includes(current.id) ? "Observe again" : "Record"}: {current.name}
            </button>
          )}
        </div>
        {!isTouch && (
          <div className="hidden rounded border border-white/20 bg-[#14201de8] p-3 font-mono text-[10px] text-white/80 md:block">
            <div className="flex items-center gap-2">
              <Move size={14} /> W A S D · move
            </div>
            <div className="mt-1 flex items-center gap-2">
              <MousePointer2 size={14} /> drag / click · look
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Compass size={14} /> ping + arrow · next clue
            </div>
          </div>
        )}
      </div>
      {isTouch && playing && <Joystick joy={joy} />}
      {isTouch && playing && current && unlocked && (
        <button
          onClick={() => interact(current.id)}
          aria-label="Interact"
          className="absolute bottom-5 right-5 z-20 grid h-20 w-20 place-items-center rounded-full border-2 border-[#17211d]/40 bg-[#e2b75f] font-mono text-xs font-bold text-[#17211d] shadow-xl"
        >
          {visited.includes(current.id) ? "Again" : "Record"}
        </button>
      )}
      {debug && (
        <div id="maru-debug" className="absolute bottom-1 left-1/2 z-50 -translate-x-1/2 bg-black/70 px-2 py-1 font-mono text-[10px] text-lime-300" />
      )}
      {notebookOpen && (
        <aside className="absolute bottom-3 right-3 top-14 z-30 w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto border border-[#d9b566]/50 bg-[#172420f5] p-4 shadow-2xl sm:top-20 sm:p-5">
          <div className="flex items-center justify-between text-[#e8c771]">
            <div className="flex items-center gap-2">
              <BookOpen size={17} />
              <h2 className="font-serif text-xl">Field notebook</h2>
            </div>
            <button onClick={() => setNotebookOpen(false)} aria-label="Close notebook" className="border border-white/25 p-1.5">
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#b8c3ae]">
            The city never gives a translation. These are observations you can test in the next encounter.
          </p>
          <div className="mt-4 space-y-3">
            {LANDMARKS.map((landmark, index) => {
              const seen = visited.includes(landmark.id);
              const available = !landmark.requires || visited.includes(landmark.requires);
              return (
                <div
                  key={landmark.id}
                  className={`border p-3 ${seen ? "border-[#668d6c] bg-[#254332]" : "border-white/15"} ${!available ? "opacity-35" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#e8c771]">
                      {String(index + 1).padStart(2, "0")} · {landmark.phase}
                    </span>
                    {seen && <span className="text-[10px] text-[#a7d7a9]">recorded</span>}
                  </div>
                  <h3 className="mt-1 font-serif">{landmark.name}</h3>
                  {seen ? (
                    <>
                      <p className="mt-2 font-serif text-lg text-[#f2d18a]">{landmark.mark}</p>
                      {landmark.spoken && (
                        <button onClick={() => speakMaru(landmark.spoken)} className="mt-1 flex items-center gap-1 text-[11px] text-[#e8c771]">
                          <Volume2 size={12} /> hear again
                        </button>
                      )}
                      <p className="mt-1 text-xs leading-relaxed text-[#d3ddd0]">{landmark.discovery}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-[#93a18f]">
                      {available ? "Find the gold circle and observe." : "A previous encounter must make this place intelligible."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}
      {speakOpen && (
        <SpeakPanel
          onClose={() => setSpeakOpen(false)}
          onDone={() => {
            setVisited((old) => (old.includes("archive") ? old : [...old, "archive"]));
            setSpeakOpen(false);
            setMessage("The archivist nods and opens the door: you said “mi eno kiru ta ganu sapo” — I need the key because the gate is closed.");
          }}
        />
      )}
      {mapOpen && <CopenhagenMap visited={visited} playerPosition={playerPosition} onEnter={() => begin()} onSelect={begin} />}
    </div>
  );
};
