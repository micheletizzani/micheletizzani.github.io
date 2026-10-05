import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { callLLM } from './llmClient';
import type { StudyEnvironment } from './types';

// Click any word inside an element marked lang="da" to see a contextual entry.
// ponytail: static glossary + naive suffix stripping; ceiling = inflections not
// covered. Upgrade path: the "Explain in context" LLM button (already wired).
const GLOSSARY: Record<string, string> = {
  i: 'in', dag: 'day', 'i dag': 'today', morgen: 'morning / tomorrow', cykler: 'bikes / (he/I) cycle(s)',
  cykel: 'bicycle', jeg: 'I', du: 'you', han: 'he', hun: 'she', det: 'it / that', den: 'it / that (en-word)',
  vi: 'we', de: 'they', på: 'on / at', arbejde: 'work', fordi: 'because', at: 'that / to (infinitive)',
  ikke: 'not', aldrig: 'never', har: 'has / have', have: 'to have', tid: 'time', drikker: 'drink(s)',
  kaffe: 'coffee', universitet: 'university', taler: 'speak(s)', dansk: 'Danish', endnu: 'yet / still',
  desværre: 'unfortunately', kan: 'can / is able to', komme: 'to come', siger: 'say(s)', spiser: 'eat(s)',
  kød: 'meat', hej: 'hi / hello', skal: 'shall / must / going to', en: 'a / an (common gender)',
  et: 'a / an (neuter)', pose: 'bag', med: 'with', nej: 'no', tak: 'thanks', ja: 'yes', behøver: 'need(s)',
  min: 'my (common)', mit: 'my (neuter)', egen: 'own', rygsæk: 'backpack', bliver: 'becomes / will be',
  kroner: 'kroner (Danish currency)', vil: 'want(s) / will', kvittering: 'receipt', send: 'send (imperative)',
  gerne: 'gladly / please / with pleasure', og: 'and', er: 'is / am / are', til: 'to / for', fra: 'from',
  hund: 'dog', skib: 'ship', vand: 'water', frokost: 'lunch (NOT breakfast)', morgenmad: 'breakfast',
  eventuelt: 'possibly / optionally', møde: 'meeting', aftale: 'agreement / appointment', anden: 'other / second',
  kl: "o'clock", bil: 'car', rolig: 'calm', flink: 'kind / nice', blank: 'shiny', gade: 'street', rød: 'red',
  lærer: 'teacher', hvid: 'white', hus: 'house', bog: 'book', nu: 'now', her: 'here', der: 'there / that (rel.)',
  hvad: 'what', hvor: 'where', hvem: 'who', hvorfor: 'why', men: 'but', eller: 'or', så: 'so / then', om: 'about / if',
  da: 'when (past) / since', hvis: 'if', ingen: 'no one / none', meget: 'very / much', også: 'also', kun: 'only',
};

const STEMS = ['ene', 'erne', 'ede', 'ende', 'en', 'et', 'er', 'ne', 'e', 'r', 't', 's'];

function lookup(word: string, env: StudyEnvironment) {
  const w = word.toLowerCase();
  const cands = [w, ...STEMS.filter((s) => w.endsWith(s) && w.length - s.length > 1).map((s) => w.slice(0, -s.length))];
  for (const c of cands) {
    const v = env.vocabulary.find((x) => x.lemma.toLowerCase() === c);
    if (v) return { lemma: v.lemma, meaning: v.meaning, ipa: v.ipa, note: v.bridge };
    if (GLOSSARY[c]) return { lemma: c, meaning: GLOSSARY[c] };
  }
  return null;
}

function wordAt(x: number, y: number): { word: string; el: Element } | null {
  const d: any = document;
  let node: Node | null = null;
  let off = 0;
  if (d.caretPositionFromPoint) {
    const p = d.caretPositionFromPoint(x, y);
    node = p?.offsetNode ?? null;
    off = p?.offset ?? 0;
  } else if (d.caretRangeFromPoint) {
    const r = d.caretRangeFromPoint(x, y);
    node = r?.startContainer ?? null;
    off = r?.startOffset ?? 0;
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const t = node.textContent || '';
  const isW = (c: string) => /[\p{L}'-]/u.test(c);
  let a = Math.min(off, t.length);
  let b = a;
  while (a > 0 && isW(t[a - 1])) a--;
  while (b < t.length && isW(t[b])) b++;
  const word = t.slice(a, b);
  const el = node.parentElement?.closest('[lang="da"]');
  return word && el ? { word, el } : null;
}

interface Props {
  environment: StudyEnvironment;
  apiKey: string;
  provider: 'gemini' | 'groq';
}

export const WordGloss: React.FC<Props> = ({ environment, apiKey, provider }) => {
  const [pop, setPop] = useState<{ x: number; y: number; word: string; sentence: string } | null>(null);
  const [ctx, setCtx] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('[data-gloss-popover]')) return;
      const hit = wordAt(e.clientX, e.clientY);
      setCtx('');
      if (!hit) return setPop(null);
      setPop({
        x: Math.min(e.clientX, window.innerWidth - 300),
        y: Math.min(e.clientY + 14, window.innerHeight - 220),
        word: hit.word,
        sentence: (hit.el.textContent || '').trim(),
      });
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPop(null);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!pop) return null;
  const entry = lookup(pop.word, environment);

  const explain = async () => {
    setLoading(true);
    try {
      setCtx(
        await callLLM(
          `Sentence: "${pop.sentence}"\nWord: "${pop.word}"\nIn <=40 words: lemma, part of speech, meaning in THIS sentence, and any Italian/English interference trap.`,
          apiKey,
          provider,
          `You are a concise Danish lexicographer for an Italian L1 / English L2 learner.`
        )
      );
    } catch (err: any) {
      setCtx(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-gloss-popover
      style={{ left: pop.x, top: pop.y }}
      className="fixed z-[100] w-72 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--accent-color)] shadow-2xl text-xs space-y-2"
    >
      <button onClick={() => setPop(null)} className="absolute top-2 right-2 opacity-60 hover:opacity-100" aria-label="Close">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="font-serif text-base font-bold text-[var(--heading-color)]">{pop.word}</div>
      {entry ? (
        <div className="space-y-1">
          <div className="font-mono text-[var(--accent-color)]">
            {entry.lemma !== pop.word.toLowerCase() && <>lemma: {entry.lemma} </>}
            {entry.ipa}
          </div>
          <div className="text-[var(--heading-color)] font-semibold">{entry.meaning}</div>
          {entry.note && <div className="opacity-70">{entry.note}</div>}
        </div>
      ) : (
        <div className="opacity-70">Not in local glossary.</div>
      )}
      <div className="opacity-50 italic border-l-2 border-[var(--border-color)] pl-2">{pop.sentence}</div>
      {ctx && <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">{ctx}</div>}
      {apiKey && !ctx && (
        <button
          onClick={explain}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[var(--accent-color)] text-black font-mono font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" /> {loading ? 'Asking…' : 'Explain in context'}
        </button>
      )}
    </div>
  );
};
