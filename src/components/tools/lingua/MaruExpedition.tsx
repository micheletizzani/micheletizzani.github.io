import React, { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Compass, Expand, Keyboard, Map, MessageCircle, Mic, MousePointer2, Shrink, Volume2, VolumeX, X } from "lucide-react";
import { chime, setMuted, speakMaru, unlockAudio } from "./maruAudio";
import { distance, grade, normalize, syllableCount } from "./maruPhonetics";
import { LANDMARKS, type Landmark, type LandmarkId } from "./maruData";
import { MaruWorld } from "./MaruWorld";
import { GlyphPhrase } from "./maruGlyphs";

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
    <section className="absolute inset-0 z-30 overflow-y-auto pb-24 bg-[#2a1520] text-[#fff3d6]">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_350px] landscape:grid-cols-[minmax(0,1fr)_320px] landscape:items-start landscape:gap-4 landscape:py-3 lg:px-10">
        <div className="order-2 rounded-sm border border-[#f2c744]/60 bg-[#e4dcc4] p-3 shadow-2xl lg:order-1 landscape:order-1">
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
                    stroke="#2a1520"
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
          <p className="font-mono text-[10px] uppercase tracking-[.22em] text-[#f2c744]">Pilot city · Copenhagen, Indre By</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#f3efe2] sm:text-5xl landscape:text-2xl">
            Start with the city, not the answer.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[#e9d5b8] [@media(max-height:480px)]:hidden">
            This is an original, navigable interpretation of Copenhagen’s historic core: Gammel Strand, Højbro Plads, Slotsholmen, Kongens Nytorv, and
            the harbour. It is a game map—not a geographic survey—but the streets, water, and landmarks determine the 3D world you will enter.
          </p>
          <button
            onClick={onEnter}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-[#f2c744] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#2a1520] hover:bg-[#ffe27a]"
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
                  className="flex w-full items-center gap-3 border border-white/15 bg-[#3a1e2b] p-3 landscape:p-2 text-left transition enabled:hover:border-[#f2c744] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs ${seen ? "bg-[#527b5a]" : "bg-[#b7793e] text-[#2a1520]"}`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-serif">{landmark.name}</span>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#d9bba8]">
                      {seen ? "observation recorded" : available ? `${landmark.phase} · choose destination` : "route not yet intelligible"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-[#c9a99a]">Or pick a marker above to set your starting destination.</p>
        </div>
      </div>
    </section>
  );
}

const SENTENCE = ["mi", "eno", "kiru", "ta", "ganu", "sapo"];
const SHUFFLED = ["ganu", "kiru", "mi", "sapo", "eno", "ta"];

// ---------- commands (rebindable) ----------
type ActionId = "interact" | "listen" | "speak" | "type" | "notebook" | "map" | "fullscreen" | "help";
const ACTIONS: { id: ActionId; label: string; hint: string; code: string }[] = [
  { id: "interact", label: "Study what is nearby", hint: "or click / tap a gold marker", code: "KeyE" },
  { id: "listen", label: "Listen again", hint: "replays the last sound", code: "KeyR" },
  { id: "speak", label: "Try to say it", hint: "uses the microphone", code: "KeyT" },
  { id: "type", label: "Type the sound", hint: "write what you hear", code: "KeyP" },
  { id: "notebook", label: "Field notebook", hint: "", code: "KeyN" },
  { id: "map", label: "City map", hint: "", code: "KeyM" },
  { id: "fullscreen", label: "Full screen", hint: "", code: "KeyF" },
  { id: "help", label: "This command list", hint: "", code: "KeyH" },
];
const RESERVED = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape", "Enter", "Tab", "Space"];
const KEYS_STORE = "maru-keys-v1";
const keyLabel = (code: string) => code.replace(/^Key|^Digit/, "");
const defaultKeys = () => Object.fromEntries(ACTIONS.map((a) => [a.id, a.code])) as Record<ActionId, string>;
const loadKeys = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS_STORE) ?? "{}");
    return { ...defaultKeys(), ...saved } as Record<ActionId, string>;
  } catch {
    return defaultKeys();
  }
};
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

// ---------- speech recognition (microphone) ----------
type RecognitionCtor = new () => {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

function useMic() {
  const [listening, setListening] = useState(false);
  const Recognition =
    typeof window === "undefined"
      ? undefined
      : ((window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition);
  const start = (target: string, onHeard: (best: string, heard: string[]) => void, onError: (message: string) => void) => {
    if (!Recognition) {
      onError("Speech recognition isn't available in this browser (Chrome and Edge have it). Type the sound instead.");
      return;
    }
    window.speechSynthesis?.cancel();
    const rec = new Recognition();
    rec.lang = "da-DK";
    rec.maxAlternatives = 5;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const heard = Array.from(event.results[0]).map((alt) => alt.transcript);
      const t = normalize(target);
      const best = heard.reduce((a, b) => (distance(normalize(b), t) < distance(normalize(a), t) ? b : a));
      onHeard(best, heard);
    };
    rec.onerror = (event) => {
      setListening(false);
      onError(
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : event.error === "no-speech"
            ? "I didn't hear anything. Try again, closer to the microphone."
            : `Speech recognition error: ${event.error}`
      );
    };
    rec.onend = () => setListening(false);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };
  return { supported: !!Recognition, listening, start };
}

type Via = "keyboard" | "voice";

const PAPER = "bg-[#f6e8c8] text-[#3a1626]";

function AnswerRow({
  target,
  onSubmit,
  onNote,
  focus = "input",
}: {
  target: string;
  onSubmit: (guess: string, via: Via, heard?: string[]) => void;
  onNote: (message: string) => void;
  focus?: "input" | "mic";
}) {
  const [text, setText] = useState("");
  const mic = useMic();
  const inputRef = useRef<HTMLInputElement>(null);
  const micRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    (focus === "mic" ? micRef : inputRef).current?.focus();
  }, [focus, target]);
  const startMic = () => mic.start(target, (best, heard) => onSubmit(best, "voice", heard), onNote);
  const micRefFn = useRef(startMic);
  micRefFn.current = startMic;
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyT") {
        event.preventDefault();
        micRefFn.current();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), "keyboard");
    setText("");
  };
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="write the sound…"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type the sound you hear"
        className="min-w-0 flex-1 border-2 border-[#3a1626] bg-[#fffaf0] px-3 py-2.5 font-serif text-lg text-[#3a1626] outline-none placeholder:text-[#3a1626]/40 focus:bg-white"
      />
      <button
        onClick={submit}
        className="border-2 border-[#3a1626] bg-[#b3263f] px-4 py-2.5 font-mono text-xs font-bold uppercase text-[#fff3d6] shadow-[2px_2px_0_#3a1626]"
      >
        Check <span className="hidden opacity-70 sm:inline">↵</span>
      </button>
      <button
        ref={micRef}
        onClick={startMic}
        disabled={mic.listening}
        title="Say it aloud (Alt+T)"
        className={`flex items-center gap-2 border-2 border-[#3a1626] px-4 py-2.5 font-mono text-xs uppercase shadow-[2px_2px_0_#3a1626] ${mic.listening ? "animate-pulse bg-[#f2c744]" : "bg-[#fffaf0]"}`}
      >
        <Mic size={14} /> {mic.listening ? "Listening…" : "Say it"} <span className="hidden opacity-50 sm:inline">Alt+T</span>
      </button>
    </div>
  );
}

/** A journal sheet that rises from the bottom, leaving the zoomed-in scene visible above it. */
function Sheet({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-2 sm:p-4">
      <div
        role="dialog"
        aria-label={label}
        className={`pointer-events-auto relative max-h-[70vh] w-full max-w-4xl overflow-y-auto border-2 border-[#3a1626] shadow-[6px_6px_0_#3a1626] ${PAPER}`}
      >
        <span className="absolute left-4 top-0 -translate-y-px bg-[#b3263f] px-3 py-1 text-[#fff3d6]">
          <BookOpen size={14} />
        </span>
        {children}
      </div>
    </div>
  );
}

function SpeakPanel({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [built, setBuilt] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const full = SENTENCE.join(" ");
  const verify = (guess: string, spoken: boolean, heard?: string[]) => {
    const result = grade(full, guess, spoken);
    if (result.passed) {
      chime();
      onDone();
    } else {
      setNote(
        `${heard ? `I heard “${guess}”. ` : ""}That is not what the guard said${result.verdict === "close" ? " — you are close" : ""}. Listen to the words again, then rebuild.`
      );
    }
  };
  const add = (word: string) => {
    speakMaru(word);
    setNote(null);
    setBuilt((old) => [...old, word]);
  };
  return (
    <Sheet label="Speak to the archivist">
      <div className="p-4 pt-8 sm:p-6 sm:pt-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b3263f]">Speak · Royal Archive</p>
            <h2 className="mt-1 font-serif text-xl text-[#3a1626] sm:text-2xl">Tell the archivist what the guard told you.</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="border-2 border-[#3a1626] p-1.5 hover:bg-[#f2c744]">
            <X size={14} />
          </button>
        </div>
        <p className="mt-2 text-xs text-[#6b4a52]">
          Say it, type it, or tap the words in order. It means: “I need the key because the gate is closed.”
        </p>
        <AnswerRow target={full} onNote={setNote} onSubmit={(guess, via, heard) => verify(guess, via === "voice", heard)} />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-[#8a6a60]">or build it from the words</p>
        <div className={`mt-2 flex min-h-[3.2rem] flex-wrap gap-2 border-2 p-2 ${note ? "border-[#b3263f]" : "border-[#3a1626]/40"}`}>
          {built.length === 0 && <span className="self-center text-xs text-[#3a1626]/40">your sentence…</span>}
          {built.map((word, i) => (
            <span key={i} className="flex items-center gap-2 bg-[#3a1626] px-3 py-1.5 text-[#fff3d6]">
              <GlyphPhrase text={word} size={22} color="#fff3d6" />
            </span>
          ))}
        </div>
        {note && <p className="mt-2 text-xs text-[#b3263f]">{note}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {SHUFFLED.map((word) => (
            <button
              key={word}
              disabled={built.includes(word)}
              onClick={() => add(word)}
              className="flex items-center gap-2 border-2 border-[#3a1626] bg-[#fffaf0] px-3 py-2 font-serif text-lg shadow-[2px_2px_0_#3a1626] enabled:hover:bg-[#f2c744] disabled:opacity-30"
            >
              <Volume2 size={13} className="text-[#b3263f]" />
              <GlyphPhrase text={word} size={24} color="#3a1626" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => verify(built.join(" "), false)}
            disabled={built.length !== SENTENCE.length}
            className="flex-1 border-2 border-[#3a1626] bg-[#b3263f] px-4 py-2.5 font-mono text-xs font-bold uppercase text-[#fff3d6] shadow-[2px_2px_0_#3a1626] disabled:opacity-40"
          >
            Say my sentence
          </button>
          <button
            onClick={() => (setBuilt([]), setNote(null))}
            className="border-2 border-[#3a1626] px-4 py-2.5 font-mono text-xs uppercase hover:bg-[#f2c744]"
          >
            Clear
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/** Guided encounter: hear it, see how it is written, guess the sound (type or say it), get pattern hints; then the meaning clue is revealed. */
function Encounter({ landmark, mode, onDone, onClose }: { landmark: Landmark; mode?: "type" | "speak"; onDone: () => void; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ tone: "info" | "bad" | "good"; text: string }>({
    tone: "info",
    text: "Listen, look at how it is written, then write what you hear — or say it yourself.",
  });
  const target = landmark.drills[index];
  const listen = useCallback((rate = 0.7) => speakMaru(target, rate), [target]);
  useEffect(() => {
    const id = window.setTimeout(() => listen(), 250);
    return () => window.clearTimeout(id);
  }, [listen]);
  const advance = (word: string) => {
    setSolved([...solved, word]);
    setTries(0);
    if (index + 1 >= landmark.drills.length) {
      onDone();
    } else {
      setIndex(index + 1);
      setFeedback({ tone: "good", text: `“${word}” ✓ — now the next sound.` });
    }
  };
  const submit = (guess: string, via: Via, heard?: string[]) => {
    const result = grade(target, guess, via === "voice");
    const said =
      via === "voice" ? `I heard “${guess}”${heard && heard.length > 1 ? ` (also: ${heard.filter((h) => h !== guess).join(", ")})` : ""}. ` : "";
    if (result.passed) {
      chime();
      advance(target);
      return;
    }
    const n = tries + 1;
    setTries(n);
    const hint =
      n === 1
        ? `It has ${syllableCount(target)} syllable${syllableCount(target) === 1 ? "" : "s"}.`
        : n === 2
          ? `Right letters in place: ${result.pattern}`
          : `Right letters in place: ${result.pattern} — or reveal it below.`;
    setFeedback({ tone: "bad", text: `${said}${result.verdict === "close" ? "Close — " : "Not quite — "}${hint}` });
  };
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyR") (event.preventDefault(), listen());
      if (event.altKey && event.code === "KeyS") (event.preventDefault(), listen(0.45));
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [listen]);
  return (
    <Sheet label={landmark.name}>
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [@media(max-height:480px)]:grid-cols-[120px_minmax(0,1fr)]">
        <div className="flex items-center gap-4 border-b-2 border-[#3a1626]/20 p-4 pt-8 md:flex-col md:justify-center md:border-b-0 md:border-r-2 md:pt-6 [@media(max-height:480px)]:flex-col [@media(max-height:480px)]:border-b-0 [@media(max-height:480px)]:border-r-2 [@media(max-height:480px)]:p-2 [@media(max-height:480px)]:pt-6">
          <div
            className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-[#3a1626] bg-[#3a1626] sm:h-28 sm:w-28 [@media(max-height:480px)]:h-[72px] [@media(max-height:480px)]:w-[72px]"
            aria-label="How it is written"
          >
            <GlyphPhrase text={target} size={landmark.drills[index].includes(" ") ? 22 : 44} color="#fff3d6" gap={4} />
          </div>
          <p className="text-xs leading-relaxed text-[#5a3a44] sm:text-sm [@media(max-height:480px)]:hidden">{landmark.scene}</p>
        </div>
        <div className="p-4 pt-3 md:pt-8 [@media(max-height:480px)]:p-2 [@media(max-height:480px)]:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b3263f]">
                {landmark.phase} · {landmark.name}
              </p>
              <h2 className="mt-0.5 font-serif text-lg text-[#3a1626] sm:text-xl">
                Sound {index + 1} of {landmark.drills.length}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="border-2 border-[#3a1626] p-1.5 hover:bg-[#f2c744]">
              <X size={14} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => listen()}
              className="flex items-center gap-2 border-2 border-[#3a1626] bg-[#f2c744] px-4 py-2.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0_#3a1626]"
            >
              <Volume2 size={14} /> Listen <span className="hidden opacity-60 sm:inline">Alt+R</span>
            </button>
            <button
              onClick={() => listen(0.45)}
              className="flex items-center gap-2 border-2 border-[#3a1626] bg-[#fffaf0] px-4 py-2.5 font-mono text-xs uppercase shadow-[2px_2px_0_#3a1626]"
            >
              <Volume2 size={14} /> Slowly <span className="hidden opacity-50 sm:inline">Alt+S</span>
            </button>
            {solved.map((word) => (
              <span key={word} className="self-center bg-[#2f8f6b] px-3 py-1.5 font-serif text-[#fff3d6]">
                {word} ✓
              </span>
            ))}
          </div>
          <AnswerRow
            target={target}
            focus={mode === "speak" ? "mic" : "input"}
            onSubmit={submit}
            onNote={(text) => setFeedback({ tone: "bad", text })}
          />
          <p
            aria-live="polite"
            className={`mt-3 min-h-[2.5rem] text-sm ${feedback.tone === "bad" ? "text-[#b3263f]" : feedback.tone === "good" ? "text-[#1f7a58]" : "text-[#5a3a44]"}`}
          >
            {feedback.text}
          </p>
          {tries >= 3 && (
            <button
              onClick={() => (speakMaru(target), advance(target))}
              className="mt-1 border-2 border-[#3a1626] px-3 py-2 font-mono text-[11px] uppercase hover:bg-[#f2c744]"
            >
              Reveal the answer and move on
            </button>
          )}
        </div>
      </div>
    </Sheet>
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

function CommandsPanel({
  keys,
  onChange,
  onReset,
  onClose,
}: {
  keys: Record<ActionId, string>;
  onChange: (next: Record<ActionId, string>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [binding, setBinding] = useState<ActionId | null>(null);
  const [note, setNote] = useState("Click a command, then press the key you want.");
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
      if (clash) next[clash] = keys[binding]; // swap, so two commands never share a key
      next[binding] = event.code;
      onChange(next);
      setNote(clash ? `Swapped with “${ACTIONS.find((a) => a.id === clash)?.label}”.` : "Saved.");
      setBinding(null);
    };
    window.addEventListener("keydown", handle, true);
    return () => window.removeEventListener("keydown", handle, true);
  }, [binding, keys, onChange]);
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#2a1520]/60 p-3">
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto border border-[#3a1626] bg-[#f6e8c8] text-[#3a1626] p-4 shadow-2xl sm:p-6"
        role="dialog"
        aria-label="Commands"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl text-[#3a1626]">
            <Keyboard size={18} className="text-[#b3263f]" /> Commands
          </h2>
          <button onClick={onClose} aria-label="Close" className="border border-[#3a1626] p-2 hover:bg-[#f2c744]">
            <X size={14} />
          </button>
        </div>
        <p className="mt-2 text-xs text-[#6b4a52]">
          Click or tap the ground to walk, and a gold marker to study it. W A S D / arrows also walk; the wheel zooms. Your key choices are saved in
          this browser.
        </p>
        <ul className="mt-4 divide-y divide-[#3a1626]/15 border border-[#3a1626]/30">
          {ACTIONS.map((action) => (
            <li key={action.id}>
              <button
                onClick={() => setBinding(action.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#f2c744]/40"
              >
                <span>
                  <span className="block text-sm">{action.label}</span>
                  {action.hint && <span className="block text-[11px] text-[#8a6a60]">{action.hint}</span>}
                </span>
                <kbd
                  className={`min-w-[2.2rem] border px-2 py-1 text-center font-mono text-xs ${binding === action.id ? "border-[#3a1626] bg-[#f2c744] text-[#3a1626]" : "border-[#3a1626]/50"}`}
                >
                  {binding === action.id ? "press…" : keyLabel(keys[action.id])}
                </kbd>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[#6b4a52]" aria-live="polite">
          {note}
        </p>
        <p className="mt-2 text-[11px] text-[#8a6a60]">Inside a lesson: Enter checks · Alt+R listen · Alt+S slowly · Alt+T say it · Esc closes.</p>
        <button
          onClick={() => (onReset(), setNote("Defaults restored."))}
          className="mt-3 border border-[#3a1626] px-3 py-2 font-mono text-[11px] uppercase"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

export const MaruExpedition: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const shell = useRef<HTMLDivElement>(null);
  const poseRef = useRef({ x: 0, z: 9.5, yaw: 0 });
  const heard = useRef(new Set<LandmarkId>());
  const lastSound = useRef("");
  const [visited, setVisited] = useState<LandmarkId[]>([]);
  const [nearby, setNearby] = useState<LandmarkId | null>(null);
  const [message, setMessage] = useState(
    "You are at Højbro Plads. Click the ground to walk, then click the glowing gold marker to meet someone. Listen: the city speaks before it explains."
  );
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [speakOpen, setSpeakOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [encounter, setEncounter] = useState<{ id: LandmarkId; mode?: "type" | "speak" } | null>(null);
  const [keys, setKeys] = useState<Record<ActionId, string>>(defaultKeys);
  const [mapOpen, setMapOpen] = useState(true);
  const [destination, setDestination] = useState<LandmarkId | null>("fountain");
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([0, 4.6]);
  const [isTouch, setIsTouch] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [debug, setDebug] = useState(false);
  const current = LANDMARKS.find((item) => item.id === nearby);
  const unlocked = !!current && (!current.requires || visited.includes(current.requires));
  const target = LANDMARKS.find((l) => !visited.includes(l.id) && (!l.requires || visited.includes(l.requires)))?.id ?? null;
  const playing = !mapOpen && !notebookOpen && !speakOpen && !helpOpen && !encounter;
  const focus: LandmarkId | null = encounter?.id ?? (speakOpen ? "archive" : null);
  const key = (id: ActionId) => keyLabel(keys[id]);

  const startEncounter = useCallback(
    (id: LandmarkId, mode?: "type" | "speak") => {
      const landmark = LANDMARKS.find((item) => item.id === id)!;
      if (landmark.requires && !visited.includes(landmark.requires)) {
        setMessage("The way is socially closed. Return when you understand more of the city.");
        return;
      }
      if (landmark.id === "archive") {
        if (visited.includes("archive")) setMessage("The archivist already knows you understood. The door stands open.");
        else (setMessage(landmark.line), setSpeakOpen(true));
        return;
      }
      lastSound.current = landmark.drills[0];
      setEncounter({ id, mode });
    },
    [visited]
  );
  const completeEncounter = useCallback((id: LandmarkId) => {
    const landmark = LANDMARKS.find((item) => item.id === id)!;
    setVisited((old) => (old.includes(id) ? old : [...old, id]));
    setEncounter(null);
    setMessage(`${landmark.line} ${landmark.discovery}`);
  }, []);
  const pick = useCallback(
    (id: LandmarkId, distanceTo: number) => {
      const landmark = LANDMARKS.find((item) => item.id === id)!;
      if (distanceTo > 6) setMessage(`${landmark.name} is ${Math.round(distanceTo)} m away. Walk closer, then click it again.`);
      else startEncounter(id);
    },
    [startEncounter]
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
        lastSound.current = landmark.drills[0] ?? landmark.spoken;
        speakMaru(landmark.spoken);
        setMessage(
          isTouch
            ? "You hear something. Tap Study (or the gold marker) — what did they say?"
            : `You hear something. Press ${keyLabel(keys.interact)} or click the gold marker to study it — what did they say?`
        );
      } else {
        setMessage(landmark.scene);
      }
    },
    [visited, keys.interact, isTouch]
  );

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(coarse);
    setDebug(window.location.search.includes("debug"));
    setKeys(loadKeys());
    if (coarse) setMessage("Tap the ground to walk, then tap the glowing gold marker to meet someone. Landscape works best.");
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS_STORE, JSON.stringify(keys));
    } catch {
      /* storage unavailable: bindings last for this session only */
    }
  }, [keys]);
  useEffect(() => setMuted(!soundOn), [soundOn]);
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

  // Keyboard commands. Typing in a field never triggers them.
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotebookOpen(false);
        setSpeakOpen(false);
        setHelpOpen(false);
        setEncounter(null);
        return;
      }
      if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const action = (Object.keys(keys) as ActionId[]).find((id) => keys[id] === event.code);
      if (!action || mapOpen) return;
      if (helpOpen && action !== "help") return;
      const near = nearby ? LANDMARKS.find((l) => l.id === nearby) : undefined;
      const open = near && (!near.requires || visited.includes(near.requires));
      switch (action) {
        case "interact":
          if (playing && near) startEncounter(near.id);
          else if (playing) setMessage(`Nothing to study here. Walk to a gold circle (follow the arrow), or click one.`);
          break;
        case "type":
        case "speak":
          if (playing && near && open) startEncounter(near.id, action);
          else if (playing) setMessage("Get close to a gold circle first.");
          break;
        case "listen":
          if (lastSound.current) speakMaru(lastSound.current);
          else setMessage("Nothing to replay yet. Walk to a gold circle and listen.");
          break;
        case "notebook":
          if (!encounter && !speakOpen) setNotebookOpen((v) => !v);
          break;
        case "map":
          if (!encounter && !speakOpen) setMapOpen(true);
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
  }, [keys, nearby, playing, mapOpen, helpOpen, encounter, speakOpen, visited, startEncounter]);

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
  const hud = "border border-white/30 bg-[#2a1520e6] text-xs hover:bg-[#b3263f]";
  const tokens = current?.spoken && visited.includes(current.id) ? Array.from(new Set(current.spoken.split(/[\s,.]+/).filter(Boolean))) : [];

  return (
    <div ref={shell} className="fixed inset-0 z-[200] overflow-hidden bg-[#2a1520] text-[#fff3d6]">
      <MaruWorld
        visited={visited}
        target={target}
        focus={focus}
        nearby={nearby}
        destination={destination}
        active={playing}
        lite={isTouch}
        debug={debug}
        poseRef={poseRef}
        onNearby={handleNearby}
        onArrive={pick}
        onPosition={setPlayerPosition}
      />
      {/* print-like finish: halftone dots and a crimson wash in the corner */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[.2] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(rgba(74,22,38,.9) 0.9px, transparent 1.1px)", backgroundSize: "4px 4px" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top_right,rgba(214,44,84,.38),transparent_42%)]" />
      {!mapOpen && !focus && <CompassHud poseRef={poseRef} target={target} />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-5 [@media(max-height:480px)]:p-2">
        <div className="pointer-events-auto flex flex-col gap-2 [@media(max-height:480px)]:flex-row">
          <div className="pointer-events-none hidden rounded border border-[#f2c744]/70 bg-[#2a1520e6] px-4 py-3 shadow-xl sm:block [@media(max-height:480px)]:hidden">
            <p className="font-serif text-xl leading-none">Maru: Copenhagen Pilot</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[.16em] text-[#f2c744]">Indre By · first-person language expedition</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMapOpen(true)} className={`${hud} flex items-center gap-2 px-3 py-2`}>
              <Map size={15} /> Map
            </button>
            <button onClick={() => setNotebookOpen((open) => !open)} className={`${hud} flex items-center gap-2 border-[#f2c744]/70 px-3 py-2`}>
              <BookOpen size={15} /> {visited.length}/5
            </button>
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={() => setHelpOpen(true)} aria-label="Commands" className={`${hud} flex items-center gap-2 px-3 py-2`}>
            <Keyboard size={15} /> <span className="hidden sm:inline">Commands</span>
          </button>
          <button onClick={() => setSoundOn((v) => !v)} aria-label={soundOn ? "Mute" : "Unmute"} className={`${hud} px-3 py-2`}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={toggleFullscreen} aria-label="Toggle full screen" className={`${hud} flex items-center gap-2 px-3 py-2`}>
            {isFs ? <Shrink size={15} /> : <Expand size={15} />}
            <span className="hidden lg:inline">{isFs ? "Exit full screen" : "Full screen"}</span>
          </button>
          <button onClick={leave} className={`${hud} flex items-center gap-2 px-3 py-2 hover:bg-[#b3263f]`}>
            <X size={15} /> <span className="hidden sm:inline">Back to games</span>
          </button>
        </div>
      </div>
      {isTouch && !mapOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 hidden justify-center portrait:flex">
          <p className="rounded border border-[#f2c744]/70 bg-[#2a1520] px-3 py-2 text-center text-xs">
            Rotate your phone to landscape for easier navigation.
          </p>
        </div>
      )}
      <div
        className={`pointer-events-none absolute bottom-3 flex items-end justify-between gap-3 ${focus ? "hidden" : ""} ${isTouch ? "left-3 right-28 portrait:right-3 portrait:bottom-24" : "left-4 right-4 sm:left-6 sm:right-6"}`}
      >
        <div className="pointer-events-auto max-h-[38vh] max-w-2xl overflow-y-auto rounded-sm border border-white/20 bg-[#2a1520ee] p-3 shadow-xl sm:p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#f2c744]">
            <MessageCircle size={14} /> {current?.phase ?? "Arrive"}
          </div>
          <p className="mt-2 text-xs leading-relaxed sm:text-base">{message}</p>
          {tokens.length > 0 && unlocked && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => speakMaru(current!.spoken)}
                aria-label="Replay"
                className="flex items-center gap-1 border border-[#f2c744]/70 px-2 py-1 text-[11px] text-[#f2c744]"
              >
                <Volume2 size={13} /> hear
              </button>
              {tokens.map((word) => (
                <button key={word} onClick={() => speakMaru(word)} className="bg-[#f2c744] px-2 py-1 font-serif text-sm text-[#2a1520]">
                  {word}
                </button>
              ))}
            </div>
          )}
          {current && unlocked && !isTouch && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => startEncounter(current.id)}
                className="inline-flex items-center gap-2 bg-[#f2c744] px-3 py-2 font-mono text-xs font-bold text-[#2a1520] hover:bg-[#ffe27a]"
              >
                <span className="border border-black/25 px-1">{key("interact")}</span> {visited.includes(current.id) ? "Study again" : "Study"}:{" "}
                {current.name}
              </button>
              {current.id !== "archive" && (
                <>
                  <button
                    onClick={() => startEncounter(current.id, "type")}
                    className="inline-flex items-center gap-2 border border-[#f2c744]/70 px-3 py-2 font-mono text-xs text-[#f2c744]"
                  >
                    <span className="border border-white/25 px-1">{key("type")}</span> type it
                  </button>
                  <button
                    onClick={() => startEncounter(current.id, "speak")}
                    className="inline-flex items-center gap-2 border border-[#f2c744]/70 px-3 py-2 font-mono text-xs text-[#f2c744]"
                  >
                    <span className="border border-white/25 px-1">{key("speak")}</span> say it
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {!isTouch && (
          <button
            onClick={() => setHelpOpen(true)}
            className="pointer-events-auto hidden rounded border border-white/20 bg-[#2a1520ee] p-3 text-left font-mono text-[10px] text-white/80 hover:border-[#f2c744]/70 md:block"
          >
            <div className="flex items-center gap-2">
              <MousePointer2 size={14} /> click ground · walk (or W A S D)
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Compass size={14} /> click a gold marker · study
            </div>
            <div className="mt-1">
              {key("interact")} study · {key("listen")} listen · {key("speak")} say · {key("type")} type
            </div>
            <div className="mt-1 flex items-center gap-2 text-[#f2c744]">
              <Keyboard size={14} /> {key("help")} · all commands / rebind
            </div>
          </button>
        )}
      </div>
      {isTouch && playing && current && unlocked && (
        <button
          onClick={() => startEncounter(current.id)}
          aria-label="Study"
          className="absolute bottom-5 right-5 z-20 grid h-20 w-20 place-items-center rounded-full border-2 border-[#17211d]/40 bg-[#f2c744] font-mono text-xs font-bold text-[#2a1520] shadow-xl"
        >
          {visited.includes(current.id) ? "Again" : "Study"}
        </button>
      )}
      {debug && (
        <div id="maru-debug" className="absolute bottom-1 left-1/2 z-50 -translate-x-1/2 bg-black/70 px-2 py-1 font-mono text-[10px] text-lime-300" />
      )}
      {notebookOpen && (
        <aside className="absolute bottom-3 right-3 top-14 z-30 w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto border border-[#f2c744]/70 bg-[#172420f5] p-4 shadow-2xl sm:top-20 sm:p-5">
          <div className="flex items-center justify-between text-[#b3263f]">
            <div className="flex items-center gap-2">
              <BookOpen size={17} />
              <h2 className="font-serif text-xl text-[#b3263f]">Field notebook</h2>
            </div>
            <button onClick={() => setNotebookOpen(false)} aria-label="Close notebook" className="border border-[#3a1626] p-1.5">
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#6b4a52]">
            The city never gives a translation. These are observations you can test in the next encounter.
          </p>
          <div className="mt-4 space-y-3">
            {LANDMARKS.map((landmark, index) => {
              const seen = visited.includes(landmark.id);
              const available = !landmark.requires || visited.includes(landmark.requires);
              return (
                <div
                  key={landmark.id}
                  className={`border p-3 ${seen ? "border-[#2f8f6b] bg-[#d9ecd0]" : "border-[#3a1626]/30"} ${!available ? "opacity-35" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#b3263f]">
                      {String(index + 1).padStart(2, "0")} · {landmark.phase}
                    </span>
                    {seen && <span className="text-[10px] text-[#1f7a58]">recorded</span>}
                  </div>
                  <h3 className="mt-1 font-serif text-[#3a1626]">{landmark.name}</h3>
                  {seen ? (
                    <>
                      <p className="mt-2 font-serif text-lg text-[#b3263f]">{landmark.mark}</p>
                      {landmark.spoken && (
                        <button onClick={() => speakMaru(landmark.spoken)} className="mt-1 flex items-center gap-1 text-[11px] text-[#b3263f]">
                          <Volume2 size={12} /> hear again
                        </button>
                      )}
                      <p className="mt-1 text-xs leading-relaxed text-[#4a2a34]">{landmark.discovery}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-[#8a6a60]">
                      {available ? "Find the gold circle and listen." : "A previous encounter must make this place intelligible."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}
      {encounter && (
        <Encounter
          key={encounter.id}
          landmark={LANDMARKS.find((l) => l.id === encounter.id)!}
          mode={encounter.mode}
          onDone={() => completeEncounter(encounter.id)}
          onClose={() => setEncounter(null)}
        />
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
      {helpOpen && <CommandsPanel keys={keys} onChange={setKeys} onReset={() => setKeys(defaultKeys())} onClose={() => setHelpOpen(false)} />}
      {mapOpen && <CopenhagenMap visited={visited} playerPosition={playerPosition} onEnter={() => begin()} onSelect={begin} />}
    </div>
  );
};
