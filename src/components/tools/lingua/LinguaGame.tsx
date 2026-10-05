import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronRight, Ear, Lightbulb, MapPin, RotateCcw, Volume2 } from 'lucide-react';
import { AFFIX_BY_ID, KIND_LABEL, WORD_BY_ID, confidence, entriesIn, literalReading, sentenceSound, truthOf, type Evidence } from './language';

type SceneId = 'fountain' | 'stall' | 'guard' | 'gate' | 'archive';
type GameState = {
  seen: string[];
  evidence: Record<string, Evidence[]>;
  hypotheses: Record<string, string>;
  heard: string[];
  completed: string[];
  finalTokens: string[];
  won: boolean;
};

const SAVE_KEY = 'maru-city-pilot-v1';
const fresh = (): GameState => ({ seen: ['fountain'], evidence: {}, hypotheses: {}, heard: [], completed: [], finalTokens: [], won: false });

const scenes: Array<{
  id: SceneId; phase: string; title: string; district: string; requires?: string; glyph: string;
  copy: string; tokens: string[]; evidence: Array<{ id: string; kind: Evidence['kind']; text: string; entries: string[] }>;
  task?: { id: string; prompt: string; answer: string; options: string[]; entries: string[]; unlock?: SceneId };
}> = [
  {
    id: 'fountain', phase: '01 · Notice', title: 'The Fountain Court', district: 'Old Market', glyph: 'sua',
    copy: 'A copper fountain runs into a stone basin. A single mark is carved into the rim and repeated on every drinking cup.', tokens: ['sua'],
    evidence: [
      { id: 'fountain-mark', kind: 'env', text: 'The sua mark appears on the fountain itself.', entries: ['sua'] },
      { id: 'cup-mark', kind: 'behavior', text: 'A child fills a cup beneath the same mark.', entries: ['sua', 'kopo'] },
    ],
    task: { id: 'water-hypothesis', prompt: 'What is the recurring mark most likely about?', answer: 'water', options: ['water', 'bread', 'gate/door'], entries: ['sua'], unlock: 'stall' },
  },
  {
    id: 'stall', phase: '02 · Connect', title: 'Nera’s Cup Stall', district: 'Old Market', requires: 'water-hypothesis', glyph: 'kopo',
    copy: 'Nera places a cup beside the fountain, points at it, then says the same short stream of sounds twice. Her price board bears two marks.', tokens: ['kopo', 'sua'],
    evidence: [
      { id: 'cup-stall', kind: 'env', text: 'The kopo mark is painted beside stacked cups.', entries: ['kopo'] },
      { id: 'vendor-request', kind: 'dialogue', text: 'Nera points to a cup, then to the fountain while speaking.', entries: ['kopo', 'sua', 'ka'] },
      { id: 'plural-cups', kind: 'behavior', text: 'When several cups are set out, the sign gains a small ending.', entries: ['kopo', 'ni'] },
    ],
    task: { id: 'plural-rule', prompt: 'Nera labels one cup “kopo” and many cups “kopo-ni”. What does -ni seem to do?', answer: 'plural', options: ['plural', 'past', 'not'], entries: ['ni'], unlock: 'guard' },
  },
  {
    id: 'guard', phase: '03 · Hear', title: 'The North Arch', district: 'Civic Steps', requires: 'plural-rule', glyph: 'kiru',
    copy: 'A gate guard taps a key against the iron lock. He repeats one phrase while showing the key, then shakes his head at an empty-handed traveller.', tokens: ['mi', 'eno', 'kiru'],
    evidence: [
      { id: 'key-gesture', kind: 'behavior', text: 'The guard raises a key whenever he says “kiru”.', entries: ['kiru'] },
      { id: 'guard-possession', kind: 'dialogue', text: 'He points to himself, says “mi eno kiru”, and holds the key.', entries: ['mi', 'eno', 'kiru'] },
      { id: 'refusal', kind: 'behavior', text: 'At the traveller he says “mi na-eno kiru” and turns away.', entries: ['mi', 'na', 'eno', 'kiru'] },
    ],
    task: { id: 'negation-rule', prompt: 'The changing piece in “na-eno” is used when the traveller has no key. Its job is…', answer: 'not', options: ['not', 'plural', 'place of'], entries: ['na'], unlock: 'gate' },
  },
  {
    id: 'gate', phase: '04 · Compose', title: 'The Closed Gate', district: 'North Quarter', requires: 'negation-rule', glyph: 'ganu',
    copy: 'The northern gate is barred. A notice reads “ganu sapo”. The guard gestures from the lock to the gate, then says a final connective word.', tokens: ['ganu', 'sapo', 'ta'],
    evidence: [
      { id: 'closed-notice', kind: 'env', text: 'The gate is visibly barred beneath the two-word notice.', entries: ['ganu', 'sapo'] },
      { id: 'because-gesture', kind: 'dialogue', text: 'The guard states a need, pauses on “ta”, then points to the closed gate.', entries: ['ta', 'ganu', 'sapo'] },
    ],
    task: { id: 'word-order', prompt: 'The guard uses “mi eno kiru”: person · action · thing. Put the pattern in order.', answer: 'subject–verb–object', options: ['subject–verb–object', 'verb–subject–object', 'object–verb–subject'], entries: ['mi', 'eno', 'kiru'], unlock: 'archive' },
  },
  {
    id: 'archive', phase: '05 · Speak', title: 'Archivist’s Door', district: 'North Quarter', requires: 'word-order', glyph: 'demo',
    copy: 'The archivist needs proof that you understood the guard—not a password. Explain why you need the key in Maru.', tokens: ['mi', 'eno', 'kiru', 'ta', 'ganu', 'sapo'], evidence: [],
  },
];

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/-/g, ''));
    utterance.rate = 0.72;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

export const LinguaGame: React.FC = () => {
  const [state, setState] = useState<GameState>(fresh);
  const [active, setActive] = useState<SceneId>('fountain');
  const [notice, setNotice] = useState('Walk slowly. Meaning lives in what people do.');

  useEffect(() => {
    try { const stored = localStorage.getItem(SAVE_KEY); if (stored) setState(JSON.parse(stored)); } catch { /* first visit */ }
  }, []);
  useEffect(() => { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }, [state]);

  const open = (scene: typeof scenes[number]) => !scene.requires || state.completed.includes(scene.requires);
  const scene = scenes.find((item) => item.id === active) ?? scenes[0];
  const hasObservedScene = scene.evidence.every((item) => state.seen.includes(item.id));
  const knownEntries = useMemo(() => [...new Set(Object.keys(state.evidence))], [state.evidence]);
  const learnEvidence = (item: typeof scene.evidence[number]) => {
    setState((old) => {
      if (old.seen.includes(item.id)) return old;
      const evidence = { ...old.evidence };
      item.entries.forEach((entry) => { evidence[entry] = [...(evidence[entry] ?? []), { id: item.id, kind: item.kind, text: item.text }]; });
      return { ...old, seen: [...old.seen, item.id], evidence };
    });
    setNotice(`${KIND_LABEL[item.kind]} recorded. Compare it with what you already know.`);
  };
  const completeTask = (task: NonNullable<typeof scene.task>, option: string) => {
    if (option !== task.answer) { setNotice('That reading does not fit all the evidence. Keep the hypothesis provisional.'); return; }
    setState((old) => ({ ...old, completed: [...new Set([...old.completed, task.id])] }));
    if (task.unlock) setActive(task.unlock);
    setNotice('The city responds. A new route is now open.');
  };
  const setHypothesis = (id: string, hypothesis: string) => setState((old) => ({ ...old, hypotheses: { ...old.hypotheses, [id]: hypothesis } }));
  const addToken = (token: string) => setState((old) => old.finalTokens.length < 6 ? { ...old, finalTokens: [...old.finalTokens, token] } : old);
  const tryFinal = () => {
    const answer = ['mi', 'eno', 'kiru', 'ta', 'ganu', 'sapo'];
    if (state.finalTokens.join('|') === answer.join('|')) {
      setState((old) => ({ ...old, won: true }));
      setNotice('The archivist nods, unbars the door, and replies: “ve demo kiru.” You understood—and were understood.');
    } else setNotice('The archivist waits. Build one idea: I have/need the key because the gate is closed.');
  };
  const reset = () => { localStorage.removeItem(SAVE_KEY); setState(fresh()); setActive('fountain'); setNotice('The square is strange again.'); };

  return <main className="min-h-screen bg-[#10191a] text-[#edf1e7] selection:bg-[#e0a64a] selection:text-[#10191a]">
    <header className="border-b border-[#53655c] bg-[#172522]/95 sticky top-0 z-20 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-7 py-3 flex flex-wrap gap-3 items-center justify-between">
        <a href="/tools" className="font-mono text-xs tracking-[.18em] text-[#d6b46a] hover:text-white">← TOOLS</a>
        <div className="text-center"><p className="font-serif text-xl tracking-wide">Maru: The North Gate</p><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#9cad9c]">A language-exploration pilot</p></div>
        <button onClick={reset} className="flex items-center gap-1.5 font-mono text-xs text-[#9cad9c] hover:text-white"><RotateCcw size={14}/> begin again</button>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 sm:px-7 py-6 grid lg:grid-cols-[240px_minmax(0,1fr)_310px] gap-5">
      <aside className="order-2 lg:order-1 rounded-sm border border-[#45584e] bg-[#172522] p-3 h-fit">
        <p className="font-mono text-[10px] text-[#d6b46a] tracking-[.18em] uppercase px-2 pb-3">City map</p>
        <div className="space-y-1">{scenes.map((place, index) => <button key={place.id} disabled={!open(place)} onClick={() => setActive(place.id)} className={`w-full text-left rounded-sm px-3 py-3 transition ${active === place.id ? 'bg-[#d6b46a] text-[#18221d]' : open(place) ? 'hover:bg-[#263a33]' : 'opacity-35 cursor-not-allowed'} `}>
          <span className="font-mono text-[10px] opacity-70">{String(index + 1).padStart(2, '0')}</span><span className="block font-serif">{place.title}</span><span className="block text-[11px] opacity-70">{open(place) ? place.district : 'language required'}</span>
        </button>)}</div>
        <div className="mt-4 p-3 border-t border-[#45584e] text-xs leading-relaxed text-[#acbba9]"><Lightbulb size={14} className="inline mr-1 text-[#d6b46a]"/> Record evidence before deciding what a mark means. A wrong guess costs nothing; it only needs more context.</div>
      </aside>

      <section className="order-1 lg:order-2 min-w-0">
        <div className="relative overflow-hidden min-h-[420px] rounded-sm border border-[#53655c] bg-[#718276] p-5 sm:p-9 shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#d7c793 1px, transparent 1px)', backgroundSize: '17px 17px' }} />
          <div className="relative flex justify-between items-start gap-4"><div><p className="font-mono text-[10px] tracking-[.2em] uppercase text-[#273930]">{scene.phase} · {scene.district}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl text-[#17231d]">{scene.title}</h1></div><MapPin className="text-[#d6b46a] fill-[#17231d]" /></div>
          <div className="relative mt-10 grid sm:grid-cols-[1fr_170px] gap-7 items-center"><p className="max-w-xl text-lg leading-relaxed text-[#17231d]">{scene.copy}</p><div className="aspect-square rounded-full border-8 border-[#b88b4a] bg-[#263a33] shadow-xl grid place-items-center"><svg viewBox="0 0 32 32" className="w-24 h-24 fill-none stroke-[#e7ddbd] stroke-2" aria-label="Maru mark"><path d={WORD_BY_ID[scene.glyph]?.glyph ?? 'M6 6H26V26H6Z'} /></svg></div></div>
          <div className="relative mt-9 rounded-sm bg-[#172522]/90 p-4 border border-[#9a7541]"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d6b46a]">Writing observed</p><div className="mt-2 flex flex-wrap items-center gap-2">{scene.tokens.map((token) => <span key={token} className="font-serif text-2xl text-white border-b border-[#789080] px-1">{token}</span>)}<button onClick={() => { speak(sentenceSound(scene.tokens)); setState((old) => ({ ...old, heard: [...new Set([...old.heard, scene.id])]})); }} className="ml-auto inline-flex items-center gap-2 text-xs font-mono text-[#d6b46a] hover:text-white"><Volume2 size={15}/> hear it</button></div>{state.heard.includes(scene.id) && <p className="mt-2 text-xs text-[#aebfac]"><Ear size={13} className="inline mr-1"/> You catch a stream: <i>{sentenceSound(scene.tokens)}</i>. No spaces arrive in speech.</p>}</div>
        </div>
        <div className="mt-4 rounded-sm border border-[#53655c] bg-[#172522] p-4 text-sm text-[#c6d0c2]"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d6b46a] mr-3">City response</span>{notice}</div>
        {scene.evidence.length > 0 && <section className="mt-5 rounded-sm border border-[#45584e] bg-[#172522] p-5"><h2 className="font-serif text-2xl">Look for evidence</h2><div className="mt-3 grid gap-2">{scene.evidence.map((item) => <button key={item.id} onClick={() => learnEvidence(item)} className={`text-left border p-3 transition ${state.seen.includes(item.id) ? 'border-[#5d8968] bg-[#244130]' : 'border-[#45584e] hover:border-[#d6b46a] hover:bg-[#22322e]'}`}><span className="font-mono text-[10px] uppercase tracking-wider text-[#d6b46a]">{KIND_LABEL[item.kind]}</span><span className="block text-sm mt-1">{state.seen.includes(item.id) ? <><Check size={14} className="inline text-[#89c38f] mr-1"/>{item.text}</> : 'Observe closely'}</span></button>)}</div></section>}
        {scene.task && <section className="mt-5 rounded-sm border border-[#9a7541] bg-[#201f19] p-5"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d6b46a]">Test a reading</p><h2 className="mt-2 font-serif text-xl">{scene.task.prompt}</h2>{!hasObservedScene && <p className="mt-2 text-sm text-[#afbcaa]">Observe every available clue before committing to a reading.</p>}<div className="mt-4 flex flex-wrap gap-2">{scene.task.options.map((option) => <button key={option} disabled={!hasObservedScene} onClick={() => completeTask(scene.task!, option)} className="border border-[#6e6149] px-3 py-2 text-sm enabled:hover:bg-[#d6b46a] enabled:hover:text-[#17231d] disabled:cursor-not-allowed disabled:opacity-35">{option}</button>)}</div></section>}
        {scene.id === 'archive' && <section className="mt-5 rounded-sm border border-[#d6b46a] bg-[#201f19] p-5"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d6b46a]">Speak productively</p><h2 className="mt-2 font-serif text-xl">Construct a sentence the archivist has never shown you.</h2><p className="mt-1 text-sm text-[#afbcaa]">Use Maru’s S–V–O order, then give the reason.</p><div className="mt-4 min-h-14 flex flex-wrap gap-2 border border-dashed border-[#6e6149] p-3">{state.finalTokens.map((token, i) => <button key={`${token}-${i}`} onClick={() => setState((old) => ({ ...old, finalTokens: old.finalTokens.filter((_, index) => index !== i) }))} className="bg-[#d6b46a] text-[#17231d] px-3 py-1 font-serif">{token}</button>)}</div><div className="mt-3 flex flex-wrap gap-2">{['mi', 'eno', 'kiru', 'ta', 'ganu', 'sapo'].map((token) => <button key={token} onClick={() => addToken(token)} className="border border-[#6e6149] px-3 py-1.5 font-serif hover:bg-[#344b3e]">{token}</button>)}</div><button onClick={tryFinal} className="mt-5 inline-flex items-center gap-2 bg-[#d6b46a] text-[#17231d] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#f0c771]">say it <ChevronRight size={15}/></button>{state.won && <p className="mt-4 p-3 bg-[#244130] text-[#d7edd8]">The North Quarter opens. You entered with symbols and leave able to make yourself understood.</p>}</section>}
      </section>

      <aside className="order-3 rounded-sm border border-[#45584e] bg-[#172522] p-4 h-fit lg:sticky lg:top-20"><div className="flex gap-2 items-center"><BookOpen size={17} className="text-[#d6b46a]"/><h2 className="font-serif text-xl">Field notebook</h2></div><p className="mt-1 text-[11px] leading-relaxed text-[#9cad9c]">Your guesses stay guesses until several contexts agree.</p><div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1">{knownEntries.length === 0 && <p className="text-sm text-[#9cad9c]">No marks observed yet.</p>}{knownEntries.map((id) => { const isAffix = !!AFFIX_BY_ID[id]; const word = WORD_BY_ID[id]; const ev = state.evidence[id] ?? []; const conf = confidence(id, ev, state.hypotheses[id]); const options = isAffix ? ['plural', 'past', 'not', 'place of'] : [truthOf(id), ...(word?.partial ?? []), 'bread', 'open', 'give'].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4); return <div key={id} className="border border-[#45584e] p-3"><div className="flex justify-between gap-2"><span className="font-serif text-lg">{id}{isAffix ? (AFFIX_BY_ID[id].kind === 'prefix' ? '–' : '–') : ''}</span><span className="font-mono text-[9px] uppercase text-[#d6b46a]">{conf.label}</span></div><p className="text-[11px] text-[#9cad9c] mt-1">{ev.length} observations · {'●'.repeat(conf.dots)}{'○'.repeat(4 - conf.dots)}</p><select value={state.hypotheses[id] ?? ''} onChange={(event) => setHypothesis(id, event.target.value)} className="mt-2 w-full bg-[#10191a] border border-[#53655c] p-2 text-sm"><option value="">record a hypothesis…</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{state.hypotheses[id] && <p className="mt-2 text-xs text-[#c4d1c1]">Reading: <i>{state.hypotheses[id]}</i></p>}</div>})}</div>{knownEntries.length > 0 && <div className="mt-4 border-t border-[#45584e] pt-3"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#d6b46a]">Current reading</p><p className="mt-1 text-sm text-[#c4d1c1]">{literalReading(scene.tokens, state.hypotheses)}</p></div>}</aside>
    </div>
  </main>;
};
