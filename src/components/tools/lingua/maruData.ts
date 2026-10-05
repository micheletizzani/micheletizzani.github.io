// Shared data for the Maru Copenhagen pilot: story landmarks and the solid geometry of the city.
// Units are metres on the ground plane (x east, z south); the map screen and the 3D world both read this.

export type LandmarkId = "fountain" | "vendor" | "guard" | "gate" | "archive";
export type Landmark = {
  id: LandmarkId;
  name: string;
  position: [number, number, number];
  mark: string;
  phase: string;
  line: string;
  spoken: string;
  scene: string;
  drills: string[];
  discovery: string;
  requires?: LandmarkId;
};

export const LANDMARKS: Landmark[] = [
  {
    id: "fountain",
    name: "Højbro Fountain",
    position: [0, 0, 2],
    mark: "sua",
    phase: "Observe",
    line: "At Højbro Plads, a child fills a cup. The same mark is carved into the fountain rim, every cup, and a public spout.",
    spoken: "sua",
    scene:
      "At Højbro Plads a child fills a cup. The same carved mark is on the fountain rim, on every cup and on a public spout. As the child drinks, they say one word.",
    drills: ["sua"],
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
    scene: "At the canal market Nera points to one cup and says a word, then points to a whole tray of cups and says a related word.",
    drills: ["kopo", "koponi"],
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
    scene: "The guard raises a key and speaks. Then he turns to an empty-handed traveller and speaks again, with one small difference.",
    drills: ["mi eno kiru", "mi naeno kiru"],
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
    scene:
      "The barred gate bears two carved marks. The guard points at them and finishes his sentence with a short new word and the sound of the marks.",
    drills: ["ta ganu sapo"],
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
    scene: "The archivist waits without translating. They need to know whether you understood the guard.",
    drills: [],
    discovery: "You have enough evidence. Build the sentence the guard taught you, then say it aloud.",
    requires: "gate",
  },
];

export type BuildingSpec = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roof: string;
  /** Which sides carry arched windows. */
  faces?: ("n" | "s" | "e" | "w")[];
};

export const BUILDINGS: BuildingSpec[] = [
  { position: [-10, 0, 6], size: [5.4, 4.6, 4.5], color: "#f1bd4a", roof: "#b33a4a", faces: ["e", "s"] },
  { position: [9, 0, 6], size: [5.7, 5.2, 4.8], color: "#f6d56f", roof: "#b33a4a", faces: ["w", "s"] },
  { position: [-10, 0, -4], size: [4.8, 5.4, 5.8], color: "#e9a23f", roof: "#7c2a3e", faces: ["e", "s"] },
  { position: [10.7, 0, -2], size: [4.6, 5.8, 6.5], color: "#f3c552", roof: "#7c2a3e", faces: ["w", "s"] },
  { position: [-8.5, 0, -12], size: [6.2, 5.6, 4.5], color: "#f8dd84", roof: "#b33a4a", faces: ["e", "s"] },
  { position: [9, 0, -11], size: [5.5, 5.6, 4.5], color: "#e8a548", roof: "#7c2a3e", faces: ["w", "s"] },
  // The Royal Archive sits in the gap on the east side, facing the street.
  { position: [10.6, 0, -7], size: [3, 5, 3.2], color: "#f9e29a", roof: "#7c2a3e", faces: ["w"] },
  // North wall with the Slotsholmen gate.
  { position: [0, 0, -14.4], size: [10, 6.4, 1.4], color: "#e6a43c", roof: "#7c2a3e", faces: ["s"] },
];

/** Where the player stands when studying each landmark (so the camera and speech bubble have a clear view). */
export const APPROACH: Record<LandmarkId, [number, number]> = {
  fountain: [0, 4.6],
  vendor: [-4.1, -0.6],
  guard: [0, -4.8],
  gate: [0, -11.1],
  archive: [7.7, -7],
};

export const WORLD = { minX: -15, maxX: 15, minZ: -17, maxZ: 12, quayZ: 8.3 };

export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
