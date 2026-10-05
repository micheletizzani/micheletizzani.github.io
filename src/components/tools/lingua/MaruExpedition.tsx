import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BookOpen,
  Bell,
  BellOff,
  Compass,
  Expand,
  Keyboard,
  Languages,
  Map,
  MessageCircle,
  MousePointer2,
  Shrink,
  Type,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { CityMapArt } from "./CityMapArt";
import { Finale } from "./Finale";
import { Lesson, type LessonTab } from "./Lesson";
import { MaruWorld } from "./MaruWorld";
import { Notebook, type NotebookTab } from "./Notebook";
import { PhoneticDictionary } from "./PhoneticDictionary";
import { onSpeechBlocked, setMuted, setPingsEnabled, unlockAudio } from "./maruAudio";
import { DEFAULT_PACK_ID, PACKS, encounter as encounterOf, getPack, isUnlocked, nextEncounter } from "./packs";
import type { EncounterId, LanguagePack } from "./packs/types";
import { emptyProgress, loadProgress, clearProgress, saveProgress, type Progress } from "./progress";
import { CloseButton, Overlay, themeVars } from "./ui";
import { VoicePanel, useVoiceReport } from "./VoicePanel";

const mapCoordinates = ([x, , z]: [number, number, number]) => ({ x: 51 + x * 2.45, y: 52 + z * 2.28 });
const PACK_STORE = "language-quest-pack";

// ---------- map screen ----------
function MapScreen({
  pack,
  progress,
  playerPosition,
  onEnter,
  onSelect,
  onPack,
}: {
  pack: LanguagePack;
  progress: Progress;
  playerPosition: [number, number];
  onEnter: () => void;
  onSelect: (id: EncounterId) => void;
  onPack: (id: string) => void;
}) {
  const player = mapCoordinates([playerPosition[0], 0, playerPosition[1]]);
  const done = progress.done;
  return (
    <section className="absolute inset-0 z-30 overflow-y-auto bg-[var(--mx-ink)] pb-24 text-[var(--mx-paper)]">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-8 px-5 py-10 landscape:items-start landscape:gap-4 landscape:py-3 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-10 landscape:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 border-2 border-[var(--mx-gold)] bg-[#e4dcc4] p-3 shadow-2xl lg:order-1 landscape:order-1">
          <svg
            viewBox="0 0 100 100"
            className="mx-auto block max-h-[78vh] w-full landscape:max-h-[88vh]"
            role="img"
            aria-label={`Stylised map of central ${pack.city}`}
          >
            <rect width="100" height="100" fill="#dccfac" />
            <CityMapArt water={pack.id === "da" ? "#6fa3bd" : "#82afb6"} />
            {pack.encounters.map((e, index) => {
              const point = mapCoordinates(e.position);
              const available = isUnlocked(pack, e.id, done);
              const seen = done.includes(e.id);
              return (
                <g key={e.id} onClick={() => available && onSelect(e.id)} className={available ? "cursor-pointer" : "cursor-not-allowed opacity-35"}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3.3"
                    fill={seen ? pack.ui.good : available ? pack.ui.gold : "#798784"}
                    stroke={pack.ui.ink}
                    strokeWidth="0.8"
                  />
                  <text x={point.x} y={point.y + 0.9} textAnchor="middle" fontFamily="Georgia, serif" fontSize="2.7" fill={pack.ui.ink}>
                    {index + 1}
                  </text>
                </g>
              );
            })}
            <circle cx={player.x} cy={player.y} r="1.6" fill={pack.ui.ink} stroke="#f7efcf" strokeWidth="0.7" />
            <path d="M91 92h5m-2.5-2.5v5" stroke="#385054" strokeWidth="0.8" />
            <text x="91" y="98" fontSize="2.5" fill="#385054">
              N
            </text>
          </svg>
        </div>
        <div className="order-1 lg:order-2 landscape:order-2">
          <p className="font-mono text-[10px] uppercase tracking-[.22em] text-[var(--mx-gold)]">
            {pack.city} · {pack.district}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[var(--mx-paper)] sm:text-5xl landscape:text-2xl">
            Start with the city, not the answer.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[var(--mx-paper)]/85 [@media(max-height:480px)]:hidden">
            {pack.id === "da"
              ? "You have just arrived at Nyhavn and you speak no Danish. Nobody will translate. Watch what people do, listen, write down the sounds, and work out what the words mean."
              : "An invented language in a sunlit Copenhagen. Nobody will translate: watch, listen, write down the sounds, and decipher it."}{" "}
            Nothing makes a sound until you ask for it.
          </p>
          <div className="mt-4 flex items-center gap-2" role="group" aria-label="Language">
            <Languages size={15} className="text-[var(--mx-gold)]" />
            {PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => onPack(p.id)}
                aria-pressed={p.id === pack.id}
                className={`border-2 border-[var(--mx-gold)] px-3 py-1.5 font-mono text-[11px] uppercase ${p.id === pack.id ? "bg-[var(--mx-gold)] font-bold text-[var(--mx-ink)]" : "hover:bg-[var(--mx-gold)]/25"}`}
              >
                {p.nativeName}
              </button>
            ))}
          </div>
          <button
            onClick={onEnter}
            className="mt-5 flex w-full items-center justify-center gap-2 bg-[var(--mx-gold)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--mx-ink)] hover:brightness-110"
          >
            <Compass size={16} /> Enter {pack.district}
          </button>
          <div className="mt-4 space-y-2">
            {pack.encounters.map((e, index) => {
              const available = isUnlocked(pack, e.id, done);
              const seen = done.includes(e.id);
              return (
                <button
                  key={e.id}
                  disabled={!available}
                  onClick={() => onSelect(e.id)}
                  className="flex w-full items-center gap-3 border border-white/20 bg-[var(--mx-ink-soft)] p-3 text-left transition enabled:hover:border-[var(--mx-gold)] disabled:cursor-not-allowed disabled:opacity-40 landscape:p-2"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs ${seen ? "bg-[var(--mx-good)] text-white" : "bg-[var(--mx-gold)] text-[var(--mx-ink)]"}`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-serif">{e.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-white/60">
                      {seen ? "recorded" : available ? `${e.phase} · choose destination` : "route not yet intelligible"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-white/60">Or pick a marker above to set your starting destination.</p>
        </div>
      </div>
    </section>
  );
}

// ---------- compass ----------
function CompassHud({
  pack,
  poseRef,
  target,
}: {
  pack: LanguagePack;
  poseRef: React.MutableRefObject<{ x: number; z: number; yaw: number }>;
  target: EncounterId | null;
}) {
  const arrow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const goal = target ? encounterOf(pack, target) : undefined;
    const tick = () => {
      if (goal && arrow.current && label.current) {
        const { x, z, yaw } = poseRef.current;
        const dx = goal.position[0] - x;
        const dz = goal.position[2] - z;
        const angle = Math.atan2(dx, -dz) + yaw;
        arrow.current.style.transform = `rotate(${(angle * 180) / Math.PI}deg)`;
        label.current.textContent = `${Math.round(Math.hypot(dx, dz))} m`;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [pack, poseRef, target]);
  if (!target) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--mx-gold)]/70 bg-[color-mix(in_srgb,var(--mx-ink)_88%,transparent)] px-3 py-1.5 text-[var(--mx-paper)] [@media(max-height:480px)]:bottom-28 [@media(max-height:480px)]:left-auto [@media(max-height:480px)]:right-3 [@media(max-height:480px)]:top-auto [@media(max-height:480px)]:translate-x-0 portrait:top-[4.2rem]">
      <div ref={arrow} data-testid="compass-arrow" className="text-[var(--mx-gold)]">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M9 1 L14 15 L9 12 L4 15Z" fill="currentColor" />
        </svg>
      </div>
      <span ref={label} className="font-mono text-[11px]" />
      <span className="max-w-[28vw] truncate font-mono text-[10px] uppercase tracking-wider text-[var(--mx-gold)]">
        {encounterOf(pack, target).name}
      </span>
    </div>
  );
}

// ---------- commands (rebindable) ----------
type ActionId = "interact" | "speak" | "type" | "notebook" | "dictionary" | "map" | "fullscreen" | "help";
const ACTIONS: { id: ActionId; label: string; hint: string; code: string }[] = [
  { id: "interact", label: "Take a closer look", hint: "or click / tap a gold marker", code: "KeyE" },
  { id: "speak", label: "Try to say the word", hint: "opens the Sound tab; Alt+T uses the microphone", code: "KeyT" },
  { id: "type", label: "Write the sound", hint: "opens the Sound tab", code: "KeyP" },
  { id: "notebook", label: "Field notebook", hint: "words, guesses, observations", code: "KeyN" },
  { id: "dictionary", label: "Phonetic dictionary", hint: "every sound, with real words to hear", code: "KeyG" },
  { id: "map", label: "City map", hint: "", code: "KeyM" },
  { id: "fullscreen", label: "Full screen", hint: "", code: "KeyF" },
  { id: "help", label: "This command list", hint: "", code: "KeyH" },
];
const RESERVED = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape", "Enter", "Tab", "Space"];
const KEYS_STORE = "language-quest-keys-v2";
const keyLabel = (code: string) => code.replace(/^Key|^Digit/, "");
const defaultKeys = () => Object.fromEntries(ACTIONS.map((a) => [a.id, a.code])) as Record<ActionId, string>;
const loadKeys = () => {
  try {
    return { ...defaultKeys(), ...JSON.parse(localStorage.getItem(KEYS_STORE) ?? "{}") } as Record<ActionId, string>;
  } catch {
    return defaultKeys();
  }
};
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

function CommandsPanel({
  keys,
  onChange,
  onReset,
  onResetProgress,
  onClose,
}: {
  keys: Record<ActionId, string>;
  onChange: (next: Record<ActionId, string>) => void;
  onReset: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}) {
  const [binding, setBinding] = useState<ActionId | null>(null);
  const [note, setNote] = useState("Click a command, then press the key you want.");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!binding) return;
    const handle = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.code === "Escape") {
        setBinding(null);
        return;
      }
      if (RESERVED.includes(event.code) || event.ctrlKey || event.metaKey || event.altKey) {
        setNote(`${keyLabel(event.code)} is reserved (movement, Enter and Esc are fixed). Pick another key.`);
        return;
      }
      const next = { ...keys };
      const clash = (Object.keys(next) as ActionId[]).find((id) => id !== binding && next[id] === event.code);
      if (clash) next[clash] = keys[binding];
      next[binding] = event.code;
      onChange(next);
      setNote(clash ? `Swapped with “${ACTIONS.find((a) => a.id === clash)?.label}”.` : "Saved.");
      setBinding(null);
    };
    window.addEventListener("keydown", handle, true);
    return () => window.removeEventListener("keydown", handle, true);
  }, [binding, keys, onChange]);
  return (
    <Overlay label="Commands" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl text-[var(--mx-ink)]">
            <Keyboard size={18} className="text-[var(--mx-accent)]" /> Commands
          </h2>
          <CloseButton onClick={onClose} />
        </div>
        <p className="mt-2 text-xs text-[var(--mx-muted)]">
          Click or tap the ground to walk, and a gold marker to look closer. W A S D or the arrows also walk; the mouse wheel zooms. Your key choices
          are saved in this browser.
        </p>
        <ul className="mt-4 divide-y divide-[var(--mx-ink)]/15 border-2 border-[var(--mx-ink)]/40">
          {ACTIONS.map((action) => (
            <li key={action.id}>
              <button
                onClick={() => setBinding(action.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[var(--mx-gold)]/40"
              >
                <span>
                  <span className="block text-sm">{action.label}</span>
                  {action.hint && <span className="block text-[11px] text-[var(--mx-muted)]">{action.hint}</span>}
                </span>
                <kbd
                  className={`min-w-[2.2rem] border-2 border-[var(--mx-ink)] px-2 py-1 text-center font-mono text-xs ${binding === action.id ? "bg-[var(--mx-gold)]" : ""}`}
                >
                  {binding === action.id ? "press…" : keyLabel(keys[action.id])}
                </kbd>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--mx-muted)]" aria-live="polite">
          {note}
        </p>
        <p className="mt-2 text-[11px] text-[var(--mx-muted)]">
          Inside a lesson: Alt+R listen · Alt+S slowly · Alt+H hint · Alt+T say it · Enter checks · Esc closes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => (onReset(), setNote("Defaults restored."))}
            className="border-2 border-[var(--mx-ink)] px-3 py-2 font-mono text-[11px] uppercase hover:bg-[var(--mx-gold)]"
          >
            Reset keys
          </button>
          <button
            onClick={() => (confirm ? (onResetProgress(), setConfirm(false), onClose()) : setConfirm(true))}
            className={`border-2 border-[var(--mx-ink)] px-3 py-2 font-mono text-[11px] uppercase ${confirm ? "bg-[var(--mx-accent)] text-[var(--mx-accent-text)]" : "hover:bg-[var(--mx-gold)]"}`}
          >
            {confirm ? "Really erase this language’s progress?" : "Reset progress"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- the game ----------
export const MaruExpedition: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const shell = useRef<HTMLDivElement>(null);
  const poseRef = useRef({ x: 0, z: 6.4, yaw: 0 });
  const zoomRef = useRef(1);
  const [packId, setPackId] = useState(DEFAULT_PACK_ID);
  const pack = getPack(packId);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [nearby, setNearby] = useState<EncounterId | null>(null);
  const [message, setMessage] = useState(
    "Click the ground to walk, then click the glowing gold marker to take a closer look. Nothing makes a sound until you ask."
  );
  const [lesson, setLesson] = useState<{ id: EncounterId; tab?: LessonTab } | null>(null);
  const [finaleOpen, setFinaleOpen] = useState(false);
  const [notebook, setNotebook] = useState<{ tab: NotebookTab } | null>(null);
  const [dictionary, setDictionary] = useState<{ insert?: (symbol: string) => void } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [voicePanel, setVoicePanel] = useState<{ reason?: "blocked" } | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [keys, setKeys] = useState<Record<ActionId, string>>(defaultKeys);
  const [destination, setDestination] = useState<EncounterId | null>(null);
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([0, 4.6]);
  const [isTouch, setIsTouch] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [pings, setPings] = useState(false);
  const [debug, setDebug] = useState(false);

  const voice = useVoiceReport(pack);
  const done = progress.done;
  const current = nearby ? encounterOf(pack, nearby) : undefined;
  const unlocked = !!current && isUnlocked(pack, current.id, done);
  const target = nextEncounter(pack, done)?.id ?? null;
  const playing = !mapOpen && !notebook && !dictionary && !lesson && !finaleOpen && !helpOpen && !voicePanel;
  const focus: EncounterId | null = lesson?.id ?? (finaleOpen ? pack.finale.encounter : null);
  const key = (id: ActionId) => keyLabel(keys[id]);

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);

  // --- language + progress persistence ---
  useEffect(() => {
    let saved = DEFAULT_PACK_ID;
    try {
      saved = localStorage.getItem(PACK_STORE) ?? DEFAULT_PACK_ID;
    } catch {
      /* default language */
    }
    setPackId(getPack(saved).id);
  }, []);
  useEffect(() => {
    setProgress(loadProgress(pack.id));
    setLoaded(true);
    setDestination(pack.encounters[0].id);
    setNearby(null);
    setLesson(null);
    setFinaleOpen(false);
  }, [pack.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loaded) saveProgress(pack.id, progress);
  }, [progress, pack.id, loaded]);
  const choosePack = (id: string) => {
    setLoaded(false);
    setPackId(id);
    try {
      localStorage.setItem(PACK_STORE, id);
    } catch {
      /* not persisted */
    }
  };

  // --- encounters ---
  const openEncounter = useCallback(
    (id: EncounterId, tab?: LessonTab) => {
      if (!isUnlocked(pack, id, progress.done)) {
        setMessage("The way is socially closed. Return when you understand more of this place.");
        return;
      }
      if (id === pack.finale.encounter) {
        if (progress.done.includes(id)) setMessage("The archivist already knows you understood. The door stands open.");
        else setFinaleOpen(true);
        return;
      }
      setLesson({ id, tab });
    },
    [pack, progress.done]
  );
  const completeLesson = useCallback(() => {
    if (!lesson) return;
    const e = encounterOf(pack, lesson.id);
    setProgress((p) => (p.done.includes(e.id) ? p : { ...p, done: [...p.done, e.id] }));
    setMessage(`${e.reveal.line} ${e.reveal.discovery}`);
    setLesson(null);
  }, [lesson, pack]);
  const finish = useCallback(() => {
    setProgress((p) => ({ ...p, done: p.done.includes(pack.finale.encounter) ? p.done : [...p.done, pack.finale.encounter], finished: true }));
    setFinaleOpen(false);
    setMessage(`${pack.finale.successLine} (“${pack.finale.translation}”) Open your notebook to see what the words really meant.`);
    setNotebook({ tab: "words" });
  }, [pack]);
  const arrived = useCallback(
    (id: EncounterId, distanceTo: number) => {
      const e = encounterOf(pack, id);
      if (distanceTo > 6) setMessage(`${e.name} is ${Math.round(distanceTo)} m away. Walk closer, then click it again.`);
      else openEncounter(id);
    },
    [pack, openEncounter]
  );
  const handleNearby = useCallback(
    (id: EncounterId | null) => {
      setNearby(id);
      if (!id) return;
      const e = encounterOf(pack, id);
      if (progress.done.includes(id)) return;
      if (isUnlocked(pack, id, progress.done))
        setMessage(
          `${e.name}: something is going on here. ${isTouch ? "Tap Look closer" : `Press ${keyLabel(keys.interact)} or click the gold marker`} to take a closer look.`
        );
    },
    [pack, progress.done, isTouch, keys.interact]
  );

  // --- environment ---
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(coarse);
    setDebug(window.location.search.includes("debug"));
    setKeys(loadKeys());
    if (coarse)
      setMessage(
        "Tap the ground to walk, then tap the glowing gold marker to take a closer look. Nothing makes a sound until you ask. Landscape works best."
      );
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS_STORE, JSON.stringify(keys));
    } catch {
      /* session only */
    }
  }, [keys]);
  useEffect(() => setMuted(!soundOn), [soundOn]);
  useEffect(() => onSpeechBlocked(() => setVoicePanel({ reason: "blocked" })), []);
  useEffect(() => setPingsEnabled(pings), [pings]);
  useEffect(() => {
    if (window.location.hash === "#street") setMapOpen(false);
  }, []);

  const toggleFullscreen = async () => {
    const el = shell.current as (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }) | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await (el?.requestFullscreen?.() ?? el?.webkitRequestFullscreen?.());
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (document.fullscreenElement && isTouch) await orientation.lock?.("landscape");
    } catch {
      /* fullscreen or orientation lock refused; the overlay already fills the viewport */
    }
  };

  // --- keyboard commands (typing in a field never triggers them) ---
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (voicePanel) setVoicePanel(null);
        else if (dictionary) setDictionary(null);
        else if (helpOpen) setHelpOpen(false);
        else if (notebook) setNotebook(null);
        else if (lesson) setLesson(null);
        else if (finaleOpen) setFinaleOpen(false);
        return;
      }
      if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const action = (Object.keys(keys) as ActionId[]).find((id) => keys[id] === event.code);
      if (!action || mapOpen) return;
      if (helpOpen && action !== "help") return;
      const near = nearby ? encounterOf(pack, nearby) : undefined;
      switch (action) {
        case "interact":
          if (playing && near) openEncounter(near.id);
          else if (playing) setMessage("Nothing to look at here. Walk to a gold marker (follow the arrow), or click one.");
          break;
        case "type":
        case "speak":
          if (playing && near) openEncounter(near.id, "sound");
          else if (playing) setMessage("Get close to a gold marker first.");
          break;
        case "notebook":
          if (!lesson && !finaleOpen) setNotebook((v) => (v ? null : { tab: "words" }));
          break;
        case "dictionary":
          setDictionary((v) => (v ? null : {}));
          break;
        case "map":
          if (!lesson && !finaleOpen) setMapOpen(true);
          break;
        case "fullscreen":
          void toggleFullscreen();
          break;
        case "help":
          setHelpOpen((v) => !v);
          break;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, nearby, playing, mapOpen, helpOpen, lesson, finaleOpen, notebook, dictionary, voicePanel, pack, openEncounter]);

  const begin = (id?: EncounterId) => {
    unlockAudio();
    if (id) {
      setDestination(id);
      setMessage(`Route marked for ${encounterOf(pack, id).name}. Follow the arrow, or just look around.`);
    }
    setMapOpen(false);
    if (!document.fullscreenElement) void toggleFullscreen();
  };
  const leave = () => (onExit ? onExit() : window.location.assign("/tools/language-hub"));
  const hud =
    "border-2 border-[var(--mx-ink)] bg-[color-mix(in_srgb,var(--mx-paper)_92%,transparent)] text-[var(--mx-ink)] text-xs shadow-[2px_2px_0_var(--mx-ink)] hover:bg-[var(--mx-gold)]";
  const wordsKnown = Object.keys(progress.words).length;

  return (
    <div
      ref={shell}
      style={{ ...themeVars(pack), background: `linear-gradient(to bottom, ${pack.world.palette.sky[0]}, ${pack.world.palette.sky[1]})` }}
      className="fixed inset-0 z-[200] overflow-hidden text-[var(--mx-ink)]"
      lang={pack.speech.synth}
    >
      <MaruWorld
        pack={pack}
        visited={done}
        target={target}
        focus={focus}
        nearby={nearby}
        destination={destination}
        active={playing}
        lite={isTouch}
        debug={debug}
        pings={pings}
        zoomRef={zoomRef}
        poseRef={poseRef}
        onNearby={handleNearby}
        onArrive={arrived}
        onPosition={setPlayerPosition}
      />
      {!mapOpen && !focus && <CompassHud pack={pack} poseRef={poseRef} target={target} />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-5 [@media(max-height:480px)]:p-2">
        <div className="pointer-events-auto flex flex-col gap-2 [@media(max-height:480px)]:flex-row">
          <div className="pointer-events-none hidden border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] px-4 py-3 shadow-[3px_3px_0_var(--mx-ink)] sm:block [@media(max-height:480px)]:hidden">
            <p className="font-serif text-xl leading-none">
              {pack.nativeName} · {pack.district}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-accent)]">language expedition</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMapOpen(true)} className={`${hud} flex items-center gap-2 px-3 py-2`}>
              <Map size={15} /> Map
            </button>
            <button onClick={() => setNotebook({ tab: "words" })} className={`${hud} flex items-center gap-2 px-3 py-2`} aria-label="Field notebook">
              <BookOpen size={15} /> {wordsKnown} <span className="hidden sm:inline">words</span>
            </button>
            <button onClick={() => setDictionary({})} className={`${hud} flex items-center gap-2 px-3 py-2`} aria-label="Phonetic dictionary">
              <Type size={15} /> <span className="hidden sm:inline">Sounds</span>
            </button>
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={() => setHelpOpen(true)} aria-label="Commands" className={`${hud} flex items-center gap-2 px-3 py-2`}>
            <Keyboard size={15} /> <span className="hidden lg:inline">Commands</span>
          </button>
          <button
            onClick={() => setVoicePanel({})}
            aria-label={voice.status === "missing" ? `No ${pack.speech.synth} voice installed` : voice.voice ? `Voice: ${voice.voice.name}` : "Voice"}
            title={voice.status === "missing" ? "No voice for this language: click for help" : voice.voice ? `Voice: ${voice.voice.name}` : "Voice"}
            className={`${hud} relative px-3 py-2`}
          >
            <AudioLines size={15} />
            <span
              className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-[var(--mx-ink)] ${voice.status === "ok" ? (voice.override ? "bg-[var(--mx-gold)]" : "bg-[var(--mx-good)]") : voice.status === "missing" ? "bg-[var(--mx-accent)]" : "bg-[var(--mx-muted)]"}`}
            />
          </button>
          <div className="flex">
            <button
              onClick={() => (zoomRef.current = Math.max(1, zoomRef.current / 1.25))}
              aria-label="Zoom out: see the whole place"
              className={`${hud} px-2.5 py-2`}
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={() => (zoomRef.current = Math.min(2.6, zoomRef.current * 1.25))}
              aria-label="Zoom in: follow the explorer"
              className={`${hud} -ml-0.5 px-2.5 py-2`}
            >
              <ZoomIn size={15} />
            </button>
          </div>
          <button
            onClick={() => setPings((v) => !v)}
            aria-pressed={pings}
            aria-label={pings ? "Turn guide pings off" : "Turn guide pings on"}
            title="Guide pings: a soft tone from the direction of the next marker"
            className={`${hud} px-3 py-2`}
          >
            {pings ? <Bell size={15} /> : <BellOff size={15} />}
          </button>
          <button onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "Mute" : "Unmute"} className={`${hud} px-3 py-2`}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={toggleFullscreen} aria-label="Toggle full screen" className={`${hud} flex items-center gap-2 px-3 py-2`}>
            {isFs ? <Shrink size={15} /> : <Expand size={15} />}
          </button>
          <button onClick={leave} className={`${hud} flex items-center gap-2 px-3 py-2`}>
            <X size={15} /> <span className="hidden sm:inline">Back to games</span>
          </button>
        </div>
      </div>
      {isTouch && !mapOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 hidden justify-center portrait:flex">
          <p className="border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] px-3 py-2 text-center text-xs">
            Rotate your phone to landscape for easier navigation.
          </p>
        </div>
      )}
      <div
        className={`pointer-events-none absolute bottom-3 flex items-end justify-between gap-3 ${focus ? "hidden" : ""} ${isTouch ? "left-3 right-28 portrait:bottom-24 portrait:right-3" : "left-4 right-4 sm:left-6 sm:right-6"}`}
      >
        <div className="pointer-events-auto max-h-[38vh] max-w-md overflow-y-auto border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] p-3 shadow-[4px_4px_0_var(--mx-ink)] sm:p-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--mx-accent)]">
            <MessageCircle size={14} /> {current?.phase ?? "Arrive"}
          </div>
          <p className="mt-2 text-xs leading-relaxed sm:text-sm">{message}</p>
          {current && unlocked && !isTouch && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => openEncounter(current.id)}
                className="inline-flex items-center gap-2 border-2 border-[var(--mx-ink)] bg-[var(--mx-gold)] px-3 py-2 font-mono text-xs font-bold shadow-[2px_2px_0_var(--mx-ink)]"
              >
                <span className="border border-[var(--mx-ink)]/40 px-1">{key("interact")}</span>{" "}
                {done.includes(current.id) ? "Look again" : "Look closer"}: {current.name}
              </button>
              {current.drills.length > 0 && (
                <button
                  onClick={() => openEncounter(current.id, "sound")}
                  className="inline-flex items-center gap-2 border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] px-3 py-2 font-mono text-xs shadow-[2px_2px_0_var(--mx-ink)]"
                >
                  <span className="border border-[var(--mx-ink)]/40 px-1">{key("type")}</span> write the sound
                </button>
              )}
            </div>
          )}
        </div>
        {!isTouch && (
          <button
            onClick={() => setHelpOpen(true)}
            className="pointer-events-auto hidden border-2 border-[var(--mx-ink)] bg-[var(--mx-paper)] p-3 text-left font-mono text-[10px] shadow-[3px_3px_0_var(--mx-ink)] hover:bg-[var(--mx-gold)] md:block [@media(max-height:480px)]:!hidden"
          >
            <div className="flex items-center gap-2">
              <MousePointer2 size={14} /> click ground · walk (or W A S D)
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Compass size={14} /> click a gold marker · look closer
            </div>
            <div className="mt-1">
              {key("interact")} look · {key("type")} sound · {key("notebook")} notebook · {key("dictionary")} sounds
            </div>
            <div className="mt-1 flex items-center gap-2 text-[var(--mx-accent)]">
              <Keyboard size={14} /> {key("help")} · all commands / rebind
            </div>
          </button>
        )}
      </div>
      {isTouch && playing && current && unlocked && (
        <button
          onClick={() => openEncounter(current.id)}
          aria-label="Look closer"
          className="absolute bottom-5 right-5 z-20 grid h-20 w-20 place-items-center rounded-full border-2 border-[var(--mx-ink)] bg-[var(--mx-gold)] text-center font-mono text-[11px] font-bold leading-tight text-[var(--mx-ink)] shadow-[3px_3px_0_var(--mx-ink)]"
        >
          {done.includes(current.id) ? "Again" : "Look closer"}
        </button>
      )}
      {debug && (
        <div id="maru-debug" className="absolute bottom-1 left-1/2 z-50 -translate-x-1/2 bg-black/70 px-2 py-1 font-mono text-[10px] text-lime-300" />
      )}

      {lesson && (
        <Lesson
          key={lesson.id}
          pack={pack}
          encounter={encounterOf(pack, lesson.id)}
          progress={progress}
          update={update}
          initialTab={lesson.tab}
          onClose={() => setLesson(null)}
          onComplete={completeLesson}
          onOpenDictionary={(insert) => setDictionary({ insert })}
        />
      )}
      {finaleOpen && <Finale pack={pack} onDone={finish} onClose={() => setFinaleOpen(false)} />}
      {notebook && <Notebook pack={pack} progress={progress} update={update} onClose={() => setNotebook(null)} initialTab={notebook.tab} />}
      {dictionary && (
        <Overlay label="Phonetic dictionary" onClose={() => setDictionary(null)}>
          <PhoneticDictionary pack={pack} progress={progress} onClose={() => setDictionary(null)} insert={dictionary.insert} />
        </Overlay>
      )}
      {voicePanel && <VoicePanel pack={pack} reason={voicePanel.reason} onClose={() => setVoicePanel(null)} />}
      {helpOpen && (
        <CommandsPanel
          keys={keys}
          onChange={setKeys}
          onReset={() => setKeys(defaultKeys())}
          onResetProgress={() => {
            clearProgress(pack.id);
            setProgress(emptyProgress());
            setMessage("Progress for this language was erased.");
          }}
          onClose={() => setHelpOpen(false)}
        />
      )}
      {mapOpen && (
        <MapScreen pack={pack} progress={progress} playerPosition={playerPosition} onEnter={() => begin()} onSelect={begin} onPack={choosePack} />
      )}
    </div>
  );
};
