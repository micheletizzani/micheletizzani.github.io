import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  Layers,
  HelpCircle,
  Play,
} from 'lucide-react';
import { MINIMAL_PAIRS } from './defaultData';
import { callLLM } from './llmClient';
import type { StudyEnvironment, UncertaintyItem } from './types';

interface TheoryViewProps {
  environment: StudyEnvironment;
  onUpdateEnvironment?: (updated: StudyEnvironment) => void;
  apiKey: string;
  provider: 'gemini' | 'groq';
}

export const TheoryView: React.FC<TheoryViewProps> = ({
  environment,
  onUpdateEnvironment,
  apiKey,
  provider,
}) => {
  const [activeTab, setActiveTab] = useState<'syntax' | 'phonetics' | 'bridges' | 'aiExplainer'>('syntax');
  const [activeSyntaxToggle, setActiveSyntaxToggle] = useState<'main' | 'subordinate'>('main');
  const [searchFilter, setSearchFilter] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loggedId, setLoggedId] = useState<string | null>(null);

  const handleLogTheoryUncertainty = (
    section: string,
    prompt: string,
    suggestionHint: string,
    solution: string,
    category: string
  ) => {
    if (!onUpdateEnvironment) return;
    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section,
      prompt,
      suggestionHint,
      solution,
      category,
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });

    setLoggedId(prompt);
    setTimeout(() => setLoggedId(null), 2500);
  };

  const speakDanish = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleAskGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer('');

    const systemPrompt = `You are a rigorous, demanding second-language acquisition linguist.
Target Language: ${environment.profile.targetLanguage}.
Student Native Language (L1): ${environment.profile.nativeLanguage} (Italian).
Student Bridge Language (L2): ${environment.profile.bridgeLanguages.join(', ')} (English).
Explain the grammar topic contrastively. Use IPA where relevant. Highlight exact failure modes (interference) and provide clear examples with English/Italian parallels. Keep it concise, structured, and pedagogical.`;

    try {
      const response = await callLLM(aiQuestion, apiKey, provider, systemPrompt, false);
      setAiAnswer(response);
    } catch (err: any) {
      setAiAnswer(
        `Error generating explanation: ${err.message}. Ensure your API key is configured or use standard grammar modules.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const falseFriends = [
    {
      word: 'frokost',
      ipa: '[ˈfʁʌkʌsd̥]',
      actualMeaning: 'Lunch / Midday meal',
      trap: 'English "breakfast" or German "Frühstück". In Danish, breakfast is "morgenmad".',
    },
    {
      word: 'eventuelt (evt.)',
      ipa: '[evɛntuˈɛlˀd̥]',
      actualMeaning: 'Possibly / optionally / if applicable',
      trap: 'English "eventually" (which means "at last" = "til sidst"). Matches Italian "eventualmente".',
    },
    {
      word: 'rolig',
      ipa: '[ˈʁoːli]',
      actualMeaning: 'Calm / peaceful / quiet',
      trap: 'English "rolling" or Italian "ruotare". (Tag det roligt = take it easy).',
    },
    {
      word: 'flink',
      ipa: '[fleŋˀk]',
      actualMeaning: 'Kind / friendly / helpful',
      trap: 'German "flink" (nimble/fast). In Danish it refers to a pleasant personality.',
    },
    {
      word: 'blank',
      ipa: '[b̥lɑŋˀ]',
      actualMeaning: 'Shiny / polished (also "broke/clueless")',
      trap: 'English "blank" (empty/unmarked). "En blank overflade" = a shiny surface.',
    },
  ];

  const filteredFalseFriends = falseFriends.filter(
    (item) =>
      item.word.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.actualMeaning.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.trap.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('syntax')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeTab === 'syntax'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Contrastive Syntax Matrix
        </button>
        <button
          onClick={() => setActiveTab('phonetics')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeTab === 'phonetics'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Copenhagen Phonetics Lab
        </button>
        <button
          onClick={() => setActiveTab('bridges')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeTab === 'bridges'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Concept Adjacency & False Friends
        </button>
        <button
          onClick={() => setActiveTab('aiExplainer')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'aiExplainer'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Grammar Explainer
        </button>
      </div>

      {/* 1. SYNTAX TAB */}
      {activeTab === 'syntax' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[var(--heading-color)]">
                  The Dual-Constraint Word Order Engine
                </h3>
                <p className="text-xs opacity-75 mt-1">
                  The primary syntactic blind spot for English & Italian speakers: main clauses require Verb-Second (V2), while subordinate clauses (*ledsætninger*) invert central adverbs.
                </p>
              </div>

              {/* Clause Toggle */}
              <div className="flex p-1 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] shrink-0">
                <button
                  onClick={() => setActiveSyntaxToggle('main')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeSyntaxToggle === 'main'
                      ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Main Clause (Hovedsætning)
                </button>
                <button
                  onClick={() => setActiveSyntaxToggle('subordinate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeSyntaxToggle === 'subordinate'
                      ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Subordinate Clause (Ledsætning)
                </button>
              </div>
            </div>

            {/* Interactive Clause Structure Visualizer */}
            {activeSyntaxToggle === 'main' ? (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-3">
                    Constituent Positions in Main Clauses (V2 Rule)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Pos 1: Fronted Element</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">I dag</span>
                      <span className="block text-[10px] opacity-60 mt-1">Today</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/40 text-[var(--accent-color)]">
                      <span className="block text-[10px] font-bold opacity-75 mb-1">Pos 2: Finite Verb</span>
                      <span className="text-sm font-bold">cykler</span>
                      <span className="block text-[10px] opacity-80 mt-1">ride / bike</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Pos 3: Subject</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">jeg</span>
                      <span className="block text-[10px] opacity-60 mt-1">I</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Pos 4: Adverbial / Object</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">på arbejde</span>
                      <span className="block text-[10px] opacity-60 mt-1">to work</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                    <b>Common English/Italian Transfer Trap:</b> *"I dag jeg cykler..."* is ungrammatical. In English you say "Today I ride...", but Danish strictly preserves the verb in slot 2.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs">
                  <h4 className="font-bold text-sm text-[var(--heading-color)] mb-2">Main Clause Negation Rule:</h4>
                  <p className="opacity-80 leading-relaxed">
                    In main clauses without fronting, the negation <b>"ikke"</b> follows the finite verb:
                  </p>
                  <div className="mt-2 font-mono p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                    <span>Han læser <b className="text-[var(--accent-color)]">ikke</b> bogen.</span>
                    <button onClick={() => speakDanish('Han læser ikke bogen')} className="text-xs opacity-60 hover:opacity-100">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] opacity-60 block mt-1">Literally: "He reads NOT the book."</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-3">
                    Constituent Positions in Subordinate Clauses (Ledsætninger)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Conjunction</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">... fordi</span>
                      <span className="block text-[10px] opacity-60 mt-1">because</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Subject</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">jeg</span>
                      <span className="block text-[10px] opacity-60 mt-1">I</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--accent-color)]/20 border border-[var(--accent-color)] text-[var(--accent-color)]">
                      <span className="block text-[10px] font-bold opacity-75 mb-1">Centraladverbium</span>
                      <span className="text-sm font-bold">IKKE</span>
                      <span className="block text-[10px] opacity-80 mt-1">not (BEFORE verb!)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Finite Verb</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">har</span>
                      <span className="block text-[10px] opacity-60 mt-1">have</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="block text-[10px] opacity-50 mb-1">Object</span>
                      <span className="text-sm font-bold text-[var(--heading-color)]">tid</span>
                      <span className="block text-[10px] opacity-60 mt-1">time</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <b>Pedagogical Golden Rule:</b> In Danish subordinate clauses (*fordi*, *at*, *da*, *hvis*), the adverb (*ikke, aldrig, ofte*) MUST PRECED the finite verb. Transferring main-clause order (*"... fordi jeg har ikke tid"*) is the #1 DU3 exam penalty.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs">
                  <h4 className="font-bold text-sm text-[var(--heading-color)] mb-2">Comparison Matrix:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="text-[10px] opacity-50 block uppercase">Hovedsætning (Main):</span>
                      <div className="mt-1 font-bold">Jeg spiser <span className="text-[var(--accent-color)]">ikke</span> kød.</div>
                      <span className="opacity-60 block mt-0.5">Adverb follows verb.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="text-[10px] opacity-50 block uppercase">Ledsætning (Subordinate):</span>
                      <div className="mt-1 font-bold">... fordi jeg <span className="text-[var(--accent-color)]">ikke spiser</span> kød.</div>
                      <span className="opacity-60 block mt-0.5">Adverb precedes verb.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Definite Suffixation Matrix */}
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-base font-serif font-bold text-[var(--heading-color)] mb-2">
              Postpositive Definite Suffixation & Gender
            </h4>
            <p className="text-xs opacity-75 mb-4">
              Unlike English or Italian where articles precede nouns (*the dog / il cane*), Danish attaches the definite article as a suffix to the noun stem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[var(--accent-color)] font-bold block mb-1">Common Gender (Fælleskøn - En) ~75%</span>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between border-b border-[var(--border-color)]/50 pb-1">
                    <span>en hund (a dog)</span>
                    <span className="text-[var(--heading-color)] font-bold">hunden (the dog)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>en cykel (a bicycle)</span>
                    <span className="text-[var(--heading-color)] font-bold">cyklen (the bicycle)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[var(--accent-color)] font-bold block mb-1">Neuter Gender (Intetkøn - Et) ~25%</span>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between border-b border-[var(--border-color)]/50 pb-1">
                    <span>et hus (a house)</span>
                    <span className="text-[var(--heading-color)] font-bold">huset (the house)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>et arbejde (a job)</span>
                    <span className="text-[var(--heading-color)] font-bold">arbejdet (the job)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHONETICS TAB */}
      {activeTab === 'phonetics' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mb-2">
              Copenhagen Phonetics Lab
            </h3>
            <p className="text-xs opacity-75 mb-6">
              Standard Danish phonology operates with non-transparent orthography. Sound distinctions cannot be derived from spelling.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-[var(--accent-color)]">1. Stød [ˀ]</span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">Laryngealization</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">
                    Not a full glottal stop. It is a creaky vocal fry / momentary constriction of the vocal folds that creates lexical contrast.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)] font-mono text-[11px]">
                  <span>hun [hun] (she) vs hund [hunˀ] (dog)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-[var(--accent-color)]">2. Blødt d [ð]</span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">Soft D</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">
                    Unlike English "th" in <i>father</i>. The tongue tip rests low behind the bottom teeth while the back approaches the soft palate (velarized approximant).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)] font-mono text-[11px]">
                  <span>gade [ˈɡ̊æːðə], rød [ʁœðˀ]</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-[var(--accent-color)]">3. Reduction [ɐ]</span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">Vowel Vocalization</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">
                    Unstressed endings (*-er*, *-re*) vocalize into a low central vowel sounding close to an Italian open "a". Adjacent "r" heavily lowers vowels.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)] font-mono text-[11px]">
                  <span>lærer [ˈleːɐ], kaffe [ˈkʰɑfə]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Pairs Bench */}
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-base font-serif font-bold text-[var(--heading-color)] mb-4">
              Acoustic Discrimination: Minimal Pairs
            </h4>

            <div className="space-y-3">
              {MINIMAL_PAIRS.map((pair) => (
                <div
                  key={pair.id}
                  className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-6 font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakDanish(pair.word1)}
                        className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:text-[var(--accent-color)]"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className="text-sm font-bold text-[var(--heading-color)]">{pair.word1}</span>{' '}
                        <span className="text-[var(--accent-color)]">{pair.ipa1}</span>
                        <span className="block text-[10px] opacity-60 font-sans">{pair.meaning1}</span>
                      </div>
                    </div>

                    <span className="opacity-30">vs</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakDanish(pair.word2)}
                        className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:text-[var(--accent-color)]"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className="text-sm font-bold text-[var(--heading-color)]">{pair.word2}</span>{' '}
                        <span className="text-[var(--accent-color)]">{pair.ipa2}</span>
                        <span className="block text-[10px] opacity-60 font-sans">{pair.meaning2}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] opacity-75 max-w-sm sm:text-right font-sans">
                    {pair.phonemicDifference}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. BRIDGES & FALSE FRIENDS */}
      {activeTab === 'bridges' && (
        <div className="space-y-6">
          {/* Sound-Shift Matrix */}
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-base font-serif font-bold text-[var(--heading-color)] mb-2">
              Systematic Sound-Shift Correspondences (English ↔ Danish)
            </h4>
            <p className="text-xs opacity-75 mb-4">
              Unlock hundreds of Danish lemmas by reversing historical Anglo-Saxon / Old Norse consonant shifts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[var(--accent-color)] font-bold block mb-1">sk ↔ sh</span>
                <div className="space-y-1 opacity-85 text-[11px]">
                  <div>skib = ship</div>
                  <div>fisk = fish</div>
                  <div>skjorte = shirt</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[var(--accent-color)] font-bold block mb-1">v ↔ w</span>
                <div className="space-y-1 opacity-85 text-[11px]">
                  <div>vand = water</div>
                  <div>vinter = winter</div>
                  <div>vej = way / road</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                <span className="text-[var(--accent-color)] font-bold block mb-1">b/v Lenition</span>
                <div className="space-y-1 opacity-85 text-[11px]">
                  <div>give = to give</div>
                  <div>have = to have</div>
                  <div>over = over</div>
                </div>
              </div>
            </div>
          </div>

          {/* False Friends Directory */}
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-base font-serif font-bold text-[var(--heading-color)]">
                  The False-Friend Interference Registry
                </h4>
                <p className="text-xs opacity-75">
                  Proactively flagged cognates that diverge semantically from English or Italian.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter false friends..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredFalseFriends.map((ff, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-sm font-bold text-[var(--accent-color)]">{ff.word}</span>
                    <span className="text-[11px] opacity-60">{ff.ipa}</span>
                    <span className="text-[var(--heading-color)] font-sans font-semibold">
                      = {ff.actualMeaning}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                    <div className="text-[11px] text-amber-400 font-sans">
                      ⚠️ {ff.trap}
                    </div>
                    {onUpdateEnvironment && (
                      <button
                        onClick={() =>
                          handleLogTheoryUncertainty(
                            'Grammar / False Friends',
                            `False Friend: "${ff.word}" (${ff.ipa})`,
                            ff.trap,
                            `${ff.word} = ${ff.actualMeaning}`,
                            'Lexicon / Interference'
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer shrink-0 ${
                          loggedId === `False Friend: "${ff.word}" (${ff.ipa})`
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-amber-400 text-amber-400'
                        }`}
                      >
                        {loggedId === `False Friend: "${ff.word}" (${ff.ipa})` ? (
                          '✓ Logged'
                        ) : (
                          "I don't know / Log"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. AI GRAMMAR EXPLAINER */}
      {activeTab === 'aiExplainer' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent-color)]" />
              Contrastive AI Grammar Engine
            </h3>
            <p className="text-xs opacity-75 mb-6">
              Ask any grammatical inquiry. The engine will contrast Danish syntax, morphology, or phonology against Italian (L1) and English (L2) to prevent interference.
            </p>

            <form onSubmit={handleAskGrammar} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={3}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="e.g. How does the Danish s-passive (fx 'det siges') differ from blive-passive, and how does it map to Italian 'si dice'?"
                  className="w-full p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs md:text-sm focus:outline-none focus:border-[var(--accent-color)] font-mono"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Analyzing Contrastive Mechanics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Explain Grammar Structure
                    </>
                  )}
                </button>
              </div>
            </form>

            {aiAnswer && (
              <div className="mt-6 p-6 rounded-xl bg-[var(--bg-color)] border border-[var(--accent-color)]/40 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {aiAnswer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
