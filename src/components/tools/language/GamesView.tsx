import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Shuffle,
  Zap,
  Volume2,
  Award,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Download,
  HelpCircle,
} from 'lucide-react';
import { SYNTAX_PUZZLES, GENDER_SPRINT_ITEMS, MINIMAL_PAIRS, ORDLIG_WORDS } from './defaultData';
import type { StudyEnvironment, VocabularyItem, UncertaintyItem } from './types';

interface GamesViewProps {
  environment: StudyEnvironment;
  onUpdateEnvironment: (updated: StudyEnvironment) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ environment, onUpdateEnvironment }) => {
  const [activeGame, setActiveGame] = useState<'scrambler' | 'gender' | 'pairs' | 'wordle' | 'srs'>('scrambler');

  const speakDanish = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // 1. SYNTAX SCRAMBLER STATE
  // ----------------------------------------------------
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = SYNTAX_PUZZLES[puzzleIndex % SYNTAX_PUZZLES.length];
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [scrambleStatus, setScrambleStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [scrambleHelpStep, setScrambleHelpStep] = useState<'none' | 'suggestion' | 'solution'>('none');

  useEffect(() => {
    // Shuffle tokens
    const shuffled = [...currentPuzzle.targetTokens].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
    setAssembledTokens([]);
    setScrambleStatus('idle');
    setScrambleHelpStep('none');
  }, [puzzleIndex]);

  const handleAddToken = (token: string, index: number) => {
    setAssembledTokens([...assembledTokens, token]);
    const updated = [...availableTokens];
    updated.splice(index, 1);
    setAvailableTokens(updated);
    setScrambleStatus('idle');
  };

  const handleRevealScrambleSolution = () => {
    setScrambleHelpStep('solution');
    setAssembledTokens([...currentPuzzle.correctOrder]);
    setAvailableTokens([]);
    setScrambleStatus('correct');
    speakDanish(currentPuzzle.correctOrder.join(' '));

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'Syntax Scrambler',
      prompt: `Constituent Order for: "${currentPuzzle.english}"`,
      suggestionHint: currentPuzzle.hint || currentPuzzle.ruleExplanation,
      solution: currentPuzzle.correctOrder.join(' '),
      category: 'Syntax V2 / Subordinate',
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const handleRemoveToken = (token: string, index: number) => {
    const updated = [...assembledTokens];
    updated.splice(index, 1);
    setAssembledTokens(updated);
    setAvailableTokens([...availableTokens, token]);
    setScrambleStatus('idle');
  };

  const handleVerifyScramble = () => {
    const isMatch =
      assembledTokens.length === currentPuzzle.correctOrder.length &&
      assembledTokens.every((t, i) => t === currentPuzzle.correctOrder[i]);

    if (isMatch) {
      setScrambleStatus('correct');
      speakDanish(assembledTokens.join(' '));
    } else {
      setScrambleStatus('incorrect');
    }
  };

  // ----------------------------------------------------
  // 2. GENDER SPRINT (EN VS ET) STATE
  // ----------------------------------------------------
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintStreak, setSprintStreak] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(30);
  const [sprintActive, setSprintActive] = useState(false);
  const [lastSprintFeedback, setLastSprintFeedback] = useState<string | null>(null);
  const [genderHelpStep, setGenderHelpStep] = useState<'none' | 'suggestion' | 'solution'>('none');

  const currentSprintItem = GENDER_SPRINT_ITEMS[sprintIndex % GENDER_SPRINT_ITEMS.length];

  useEffect(() => {
    let timer: any;
    if (sprintActive && sprintTimeLeft > 0) {
      timer = setInterval(() => setSprintTimeLeft((prev) => prev - 1), 1000);
    } else if (sprintTimeLeft === 0) {
      setSprintActive(false);
    }
    return () => clearInterval(timer);
  }, [sprintActive, sprintTimeLeft]);

  const handleGenderChoice = (gender: 'en' | 'et') => {
    if (!sprintActive) return;
    setGenderHelpStep('none');

    if (gender === currentSprintItem.gender) {
      setSprintScore((prev) => prev + 10 + sprintStreak * 2);
      setSprintStreak((prev) => prev + 1);
      setLastSprintFeedback(`Correct! ${gender} ${currentSprintItem.word} (${currentSprintItem.hint})`);
    } else {
      setSprintStreak(0);
      setLastSprintFeedback(
        `Wrong: it is "${currentSprintItem.gender} ${currentSprintItem.word}". Hint: ${currentSprintItem.hint}`
      );
    }
    setSprintIndex((prev) => prev + 1);
  };

  const handleRevealGenderSolution = () => {
    setGenderHelpStep('solution');
    setSprintStreak(0);
    setLastSprintFeedback(`Logged "${currentSprintItem.gender} ${currentSprintItem.word}". Hint: ${currentSprintItem.hint}`);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'Gender Sprint',
      prompt: `Grammatical Gender: "${currentSprintItem.word}"`,
      suggestionHint: currentSprintItem.hint,
      solution: `${currentSprintItem.gender} ${currentSprintItem.word}`,
      category: 'Morphology / Gender',
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });

    setTimeout(() => {
      setGenderHelpStep('none');
      setSprintIndex((prev) => prev + 1);
    }, 1200);
  };

  const startGenderSprint = () => {
    setSprintIndex(0);
    setSprintScore(0);
    setSprintStreak(0);
    setSprintTimeLeft(30);
    setSprintActive(true);
    setLastSprintFeedback(null);
    setGenderHelpStep('none');
  };

  // ----------------------------------------------------
  // 3. MINIMAL PAIR GAUNTLET STATE
  // ----------------------------------------------------
  const [pairIndex, setPairIndex] = useState(0);
  const currentPair = MINIMAL_PAIRS[pairIndex % MINIMAL_PAIRS.length];
  const [pairTargetIsFirst, setPairTargetIsFirst] = useState(true);
  const [pairFeedback, setPairFeedback] = useState<string | null>(null);
  const [pairHelpStep, setPairHelpStep] = useState<'none' | 'suggestion' | 'solution'>('none');

  useEffect(() => {
    setPairTargetIsFirst(Math.random() > 0.5);
    setPairFeedback(null);
    setPairHelpStep('none');
  }, [pairIndex]);

  const playTargetSound = () => {
    const word = pairTargetIsFirst ? currentPair.word1 : currentPair.word2;
    speakDanish(word);
  };

  const handlePairGuess = (choseFirst: boolean) => {
    setPairHelpStep('none');
    const isCorrect = choseFirst === pairTargetIsFirst;
    if (isCorrect) {
      setPairFeedback(
        `Correct! You distinguished ${pairTargetIsFirst ? currentPair.word1 : currentPair.word2}. Difference: ${currentPair.phonemicDifference}`
      );
    } else {
      setPairFeedback(
        `Incorrect. The target sound was "${pairTargetIsFirst ? currentPair.word1 : currentPair.word2}". Look out for: ${currentPair.phonemicDifference}`
      );
    }
  };

  const handleRevealPairSolution = () => {
    setPairHelpStep('solution');
    const targetWord = pairTargetIsFirst ? currentPair.word1 : currentPair.word2;
    const targetIPA = pairTargetIsFirst ? currentPair.ipa1 : currentPair.ipa2;
    const targetMeaning = pairTargetIsFirst ? currentPair.meaning1 : currentPair.meaning2;

    setPairFeedback(`Revealed target: "${targetWord}" (${targetIPA}) - ${targetMeaning}. Phonemic contrast: ${currentPair.phonemicDifference}`);
    speakDanish(targetWord);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'Acoustic Gauntlet',
      prompt: `Minimal Pair: ${currentPair.word1} (${currentPair.ipa1}) vs ${currentPair.word2} (${currentPair.ipa2})`,
      suggestionHint: currentPair.phonemicDifference,
      solution: `Target: "${targetWord}" (${targetIPA}) - ${targetMeaning}`,
      category: 'Phonetics / Stød & Vowels',
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  // ----------------------------------------------------
  // 4. ORDLIG (DANISH WORDLE) STATE
  // ----------------------------------------------------
  const [wordleTarget, setWordleTarget] = useState(ORDLIG_WORDS[0]);
  const [wordleGuesses, setWordleGuesses] = useState<string[]>([]);
  const [wordleCurrentInput, setWordleCurrentInput] = useState('');
  const [wordleCompleted, setWordleCompleted] = useState(false);
  const [wordleHelpStep, setWordleHelpStep] = useState<'none' | 'suggestion' | 'solution'>('none');

  const handleWordleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordleCurrentInput.length !== 5 || wordleCompleted) return;

    const guess = wordleCurrentInput.toUpperCase();
    const updated = [...wordleGuesses, guess];
    setWordleGuesses(updated);
    setWordleCurrentInput('');

    if (guess === wordleTarget.word || updated.length >= 6) {
      setWordleCompleted(true);
      speakDanish(wordleTarget.word);
    }
  };

  const handleRevealWordleSolution = () => {
    setWordleHelpStep('solution');
    setWordleGuesses((prev) => [...prev, wordleTarget.word]);
    setWordleCompleted(true);
    speakDanish(wordleTarget.word);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'Ordlig (Wordle)',
      prompt: `5-letter Danish Lemma: "${wordleTarget.meaning}"`,
      suggestionHint: `IPA: ${wordleTarget.ipa}, Starts with: ${wordleTarget.word[0]}`,
      solution: `${wordleTarget.word} (${wordleTarget.meaning})`,
      category: 'Lexicon / Orthography',
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const resetWordle = () => {
    const randomWord = ORDLIG_WORDS[Math.floor(Math.random() * ORDLIG_WORDS.length)];
    setWordleTarget(randomWord);
    setWordleGuesses([]);
    setWordleCurrentInput('');
    setWordleCompleted(false);
    setWordleHelpStep('none');
  };

  // ----------------------------------------------------
  // 5. SPACED REPETITION (FSRS / SM-2) FLASHCARD STATE
  // ----------------------------------------------------
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardHelpStep, setCardHelpStep] = useState<'none' | 'suggestion' | 'solution'>('none');
  const activeCards = environment.vocabulary;
  const currentCard = activeCards[cardIndex % Math.max(1, activeCards.length)];

  const handleRevealCardSolution = () => {
    setCardHelpStep('solution');
    setIsFlipped(true);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'FSRS Flashcards',
      prompt: `Active Recall Lemma: "${currentCard.lemma}" (${currentCard.ipa})`,
      suggestionHint: `Etymological Bridge: ${currentCard.bridge}`,
      solution: `${currentCard.meaning} ${currentCard.notes ? `[${currentCard.notes}]` : ''}`,
      category: 'Lexical Acquisition',
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const handleGradeCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    setCardHelpStep('none');

    let nextInterval = currentCard.srs.interval;
    let nextReps = currentCard.srs.repetitions;
    let nextEase = currentCard.srs.easeFactor;

    if (rating === 'again') {
      nextInterval = 1;
      nextReps = 0;
      nextEase = Math.max(1.3, nextEase - 0.2);
    } else if (rating === 'hard') {
      nextInterval = Math.max(1, Math.round(nextInterval * 1.2));
      nextEase = Math.max(1.3, nextEase - 0.15);
    } else if (rating === 'good') {
      nextInterval = Math.round((nextInterval || 1) * nextEase);
      nextReps += 1;
    } else if (rating === 'easy') {
      nextInterval = Math.round((nextInterval || 1) * nextEase * 1.5);
      nextReps += 1;
      nextEase += 0.15;
    }

    // Set due date
    const due = new Date();
    due.setDate(due.getDate() + nextInterval);

    const updatedVocab = environment.vocabulary.map((v) =>
      v.id === currentCard.id
        ? {
            ...v,
            srs: {
              interval: nextInterval,
              repetitions: nextReps,
              easeFactor: nextEase,
              dueDate: due.toISOString().slice(0, 10),
            },
          }
        : v
    );

    onUpdateEnvironment({
      ...environment,
      vocabulary: updatedVocab,
    });

    setIsFlipped(false);
    setCardIndex((prev) => prev + 1);
  };

  const handleExportAnkiDeck = () => {
    if (environment.vocabulary.length === 0) return;
    const tsvRows = environment.vocabulary.map(
      (v) => `${v.lemma}\t${v.ipa} ${v.meaning} (Bridge: ${v.bridge}) [${v.notes || ''}]`
    );
    const blob = new Blob([tsvRows.join('\n')], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${environment.profile.targetLanguage.toLowerCase()}_anki_deck.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Game Selector Sub-Tabs */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveGame('scrambler')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeGame === 'scrambler'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" /> 1. Syntax Scrambler (V2)
        </button>
        <button
          onClick={() => setActiveGame('gender')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeGame === 'gender'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> 2. Gender Sprint (En vs Et)
        </button>
        <button
          onClick={() => setActiveGame('pairs')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeGame === 'pairs'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" /> 3. Acoustic Gauntlet
        </button>
        <button
          onClick={() => setActiveGame('wordle')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeGame === 'wordle'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" /> 4. Ordlig (Wordle)
        </button>
        <button
          onClick={() => setActiveGame('srs')}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeGame === 'srs'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> 5. FSRS Flashcards
        </button>
      </div>

      {/* 1. SYNTAX SCRAMBLER */}
      {activeGame === 'scrambler' && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                Constituent Ordering Puzzle ({currentPuzzle.sentenceType.toUpperCase()} CLAUSE)
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">
                "{currentPuzzle.english}"
              </h3>
              {currentPuzzle.italianBridge && (
                <span className="text-xs opacity-60 mt-0.5 block">
                  Bridge: {currentPuzzle.italianBridge}
                </span>
              )}
            </div>

            <button
              onClick={() => setPuzzleIndex((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next Sentence
            </button>
          </div>

          {/* Construction Target Tray */}
          <div className="min-h-[70px] p-4 rounded-xl bg-[var(--bg-color)] border-2 border-dashed border-[var(--border-color)] flex flex-wrap items-center gap-2">
            {assembledTokens.length === 0 ? (
              <span className="text-xs opacity-40 font-mono">
                Click tiles below to assemble valid word order...
              </span>
            ) : (
              assembledTokens.map((tok, idx) => (
                <button
                  key={idx}
                  lang="da"
                  onClick={() => handleRemoveToken(tok, idx)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent-color)] text-black font-mono font-bold text-xs shadow hover:opacity-85 transition-all"
                >
                  {tok}
                </button>
              ))
            )}
          </div>

          {/* Available Word Tiles */}
          <div className="flex flex-wrap gap-2 pt-2">
            {availableTokens.map((tok, idx) => (
              <button
                key={idx}
                lang="da"
                onClick={() => handleAddToken(tok, idx)}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono font-medium transition-all"
              >
                {tok}
              </button>
            ))}
          </div>

          {/* Verification & Linguistic Explanation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleVerifyScramble}
                disabled={assembledTokens.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
              >
                Verify Syntax Constraints
              </button>
              {scrambleHelpStep === 'none' && (
                <button
                  onClick={() => setScrambleHelpStep('suggestion')}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-amber-400 text-amber-400 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  I don't know (Hint first)
                </button>
              )}
            </div>

            {scrambleStatus === 'correct' && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Correct! {currentPuzzle.ruleExplanation}
                </span>
              </div>
            )}

            {scrambleStatus === 'incorrect' && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Syntactic constraint broken. Remember: {currentPuzzle.ruleExplanation}
                </span>
              </div>
            )}
          </div>

          {/* Progressive Scramble Help Card */}
          {scrambleHelpStep !== 'none' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-2 text-amber-300 text-xs font-mono">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    Pedagogical Syntax Hint:
                  </span>
                  <p>{currentPuzzle.hint || currentPuzzle.ruleExplanation}</p>
                </div>
              </div>
              {scrambleHelpStep === 'suggestion' && (
                <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-amber-300/80">
                    Still uncertain? Revealing the answer will log this structure for revision.
                  </span>
                  <button
                    onClick={handleRevealScrambleSolution}
                    className="px-4 py-2 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shrink-0"
                  >
                    Reveal Solution & Log Item
                  </button>
                </div>
              )}
              {scrambleHelpStep === 'solution' && (
                <div className="text-[11px] font-mono text-green-400">
                  Logged to Revision Queue: "{currentPuzzle.correctOrder.join(' ')}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. GENDER SPRINT */}
      {activeGame === 'gender' && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                Arcade Speed Drill
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">
                Gender Sprint: En vs Et
              </h3>
              <p className="text-xs opacity-75 mt-0.5">
                Classify Danish nouns into Fælleskøn (En) or Intetkøn (Et) under time pressure.
              </p>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="p-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-color)]" />
                <span>{sprintTimeLeft}s</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                Score: <b className="text-[var(--accent-color)]">{sprintScore}</b> (Streak: {sprintStreak})
              </div>
            </div>
          </div>

          {!sprintActive && sprintTimeLeft === 30 ? (
            <div className="text-center py-10 space-y-4">
              <Zap className="w-12 h-12 text-[var(--accent-color)] mx-auto opacity-80" />
              <p className="text-sm opacity-80 max-w-sm mx-auto">
                Ready to drill morphological gender? You will have 30 seconds to categorize high-frequency lemmas.
              </p>
              <button
                onClick={startGenderSprint}
                className="px-8 py-3 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 shadow-lg cursor-pointer"
              >
                Start 30s Sprint
              </button>
            </div>
          ) : !sprintActive && sprintTimeLeft === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Award className="w-12 h-12 text-[var(--accent-color)] mx-auto" />
              <h4 className="text-xl font-serif font-bold text-[var(--heading-color)]">Sprint Completed!</h4>
              <p className="text-sm font-mono opacity-80">Final Score: {sprintScore}</p>
              <button
                onClick={startGenderSprint}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs uppercase"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-8">
              <div>
                <span className="text-xs font-mono opacity-50 uppercase">Categorize Noun:</span>
                <div lang="da" className="text-4xl md:text-5xl font-serif font-bold text-[var(--heading-color)] mt-2">
                  {currentSprintItem.word}
                </div>
              </div>

              <div className="flex justify-center gap-6 max-w-xs mx-auto">
                <button
                  onClick={() => handleGenderChoice('en')}
                  className="flex-1 py-4 rounded-2xl bg-[var(--accent-color)] text-black font-mono font-bold text-lg hover:opacity-90 transition-transform active:scale-95 shadow-md cursor-pointer"
                >
                  EN
                </button>
                <button
                  onClick={() => handleGenderChoice('et')}
                  className="flex-1 py-4 rounded-2xl bg-[var(--bg-color)] border-2 border-[var(--accent-color)] text-[var(--heading-color)] font-mono font-bold text-lg hover:bg-[var(--accent-color)] hover:text-black transition-transform active:scale-95 shadow-md cursor-pointer"
                >
                  ET
                </button>
              </div>

              {/* I Don't Know progressive flow for Gender Sprint */}
              {genderHelpStep === 'none' ? (
                <div className="text-center">
                  <button
                    onClick={() => setGenderHelpStep('suggestion')}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-amber-400 text-amber-400 font-mono text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    I don't know (Morphological Hint first)
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto text-left space-y-3">
                  <div className="flex items-start gap-2 text-amber-300 text-xs font-mono">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-1">
                        Gender Rule Cue:
                      </span>
                      <p>{currentSprintItem.hint}</p>
                    </div>
                  </div>
                  {genderHelpStep === 'suggestion' && (
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-mono text-amber-300/80">
                        Log item into uncertainty queue for spaced review?
                      </span>
                      <button
                        onClick={handleRevealGenderSolution}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shrink-0"
                      >
                        Reveal & Log
                      </button>
                    </div>
                  )}
                  {genderHelpStep === 'solution' && (
                    <div className="text-[11px] font-mono text-green-400">
                      Answer: {currentSprintItem.gender} {currentSprintItem.word} (Logged)
                    </div>
                  )}
                </div>
              )}

              {lastSprintFeedback && (
                <div className="text-xs font-mono opacity-80">{lastSprintFeedback}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. ACOUSTIC GAUNTLET */}
      {activeGame === 'pairs' && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                Acoustic Ear Training
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">
                Minimal Pair Stød & Vowel Gauntlet
              </h3>
            </div>
            <button
              onClick={() => setPairIndex((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next Minimal Pair
            </button>
          </div>

          <div className="text-center py-6 space-y-4">
            <button
              onClick={playTargetSound}
              className="p-5 rounded-2xl bg-[var(--accent-color)]/20 border-2 border-[var(--accent-color)] text-[var(--accent-color)] hover:scale-105 transition-all inline-flex items-center gap-3 cursor-pointer shadow-lg"
            >
              <Volume2 className="w-8 h-8" />
              <span className="font-mono text-sm font-bold uppercase">Play Target Acoustic Sample</span>
            </button>
            <p className="text-xs opacity-70">
              Listen closely to determine whether the speaker produced creaky stød or plain phonation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => handlePairGuess(true)}
              className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-center transition-all cursor-pointer"
            >
              <span lang="da" className="text-base font-serif font-bold text-[var(--heading-color)] block">
                {currentPair.word1}
              </span>
              <span className="font-mono text-xs text-[var(--accent-color)] block mt-0.5">
                {currentPair.ipa1}
              </span>
              <span className="text-[11px] opacity-60 block mt-1">{currentPair.meaning1}</span>
            </button>

            <button
              onClick={() => handlePairGuess(false)}
              className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-center transition-all cursor-pointer"
            >
              <span lang="da" className="text-base font-serif font-bold text-[var(--heading-color)] block">
                {currentPair.word2}
              </span>
              <span className="font-mono text-xs text-[var(--accent-color)] block mt-0.5">
                {currentPair.ipa2}
              </span>
              <span className="text-[11px] opacity-60 block mt-1">{currentPair.meaning2}</span>
            </button>
          </div>

          {/* I Don't Know progressive flow for Minimal Pairs */}
          {pairHelpStep === 'none' ? (
            <div className="text-center pt-2">
              <button
                onClick={() => setPairHelpStep('suggestion')}
                className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-amber-400 text-amber-400 font-mono text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                I don't know (Acoustic Cue first)
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-lg mx-auto space-y-3">
              <div className="flex items-start gap-2 text-amber-300 text-xs font-mono">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    Acoustic Discrimination Cue:
                  </span>
                  <p>{currentPair.phonemicDifference}</p>
                </div>
              </div>
              {pairHelpStep === 'suggestion' && (
                <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-amber-300/80">
                    Log this phonemic pair to your Uncertainty Queue?
                  </span>
                  <button
                    onClick={handleRevealPairSolution}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shrink-0"
                  >
                    Reveal Target & Log
                  </button>
                </div>
              )}
            </div>
          )}

          {pairFeedback && (
            <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs text-center font-mono opacity-90 max-w-lg mx-auto">
              {pairFeedback}
            </div>
          )}
        </div>
      )}

      {/* 4. ORDLIG (WORDLE) */}
      {activeGame === 'wordle' && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                Active Vocabulary Wordle
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">
                Ordlig (5-Letter Danish Lemma Guess)
              </h3>
            </div>
            <button
              onClick={resetWordle}
              className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Word
            </button>
          </div>

          {/* Word Grid */}
          <div className="flex flex-col items-center gap-2 py-4">
            {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
              const guess = wordleGuesses[rowIdx] || '';
              return (
                <div key={rowIdx} className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((colIdx) => {
                    const char = guess[colIdx] || '';
                    let bgColor = 'bg-[var(--bg-color)] border-[var(--border-color)]';
                    if (guess) {
                      if (wordleTarget.word[colIdx] === char) {
                        bgColor = 'bg-green-600 text-white border-green-600 font-bold';
                      } else if (wordleTarget.word.includes(char)) {
                        bgColor = 'bg-amber-600 text-white border-amber-600 font-bold';
                      } else {
                        bgColor = 'bg-neutral-800 text-white/50 border-neutral-700';
                      }
                    }
                    return (
                      <div
                        key={colIdx}
                        className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-mono text-base font-bold ${bgColor}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Input Form & I Don't Know */}
          {!wordleCompleted ? (
            <div className="space-y-4">
              <form onSubmit={handleWordleSubmit} className="flex justify-center gap-3 max-w-sm mx-auto">
                <input
                  type="text"
                  maxLength={5}
                  value={wordleCurrentInput}
                  onChange={(e) => setWordleCurrentInput(e.target.value.toUpperCase())}
                  placeholder="5 letters..."
                  className="w-40 p-2.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-center font-mono text-sm tracking-widest uppercase focus:outline-none focus:border-[var(--accent-color)]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={wordleCurrentInput.length !== 5}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs uppercase disabled:opacity-40"
                >
                  Guess
                </button>
              </form>

              {wordleHelpStep === 'none' ? (
                <div className="text-center">
                  <button
                    onClick={() => setWordleHelpStep('suggestion')}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-amber-400 text-amber-400 font-mono text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    I don't know (Etymological Hint first)
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-sm mx-auto space-y-3">
                  <div className="flex items-start gap-2 text-amber-300 text-xs font-mono">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-1">
                        Lexical Hint:
                      </span>
                      <p>Meaning: "{wordleTarget.meaning}" (IPA: {wordleTarget.ipa})</p>
                      <p className="text-[10px] opacity-75 mt-0.5">Initial letter: {wordleTarget.word[0]}</p>
                    </div>
                  </div>
                  {wordleHelpStep === 'suggestion' && (
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-amber-300/80">
                        Reveal lemma and queue for revision?
                      </span>
                      <button
                        onClick={handleRevealWordleSolution}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shrink-0"
                      >
                        Reveal Word & Log
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2 pt-2">
              <span className="text-xs font-mono text-green-400 font-bold block">
                Target Word: {wordleTarget.word} {wordleTarget.ipa}
              </span>
              <p className="text-xs opacity-75">{wordleTarget.meaning}</p>
            </div>
          )}
        </div>
      )}

      {/* 5. FSRS SPACED REPETITION ENGINE */}
      {activeGame === 'srs' && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                Algorithmic Memory Retention
              </span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">
                Spaced Repetition (FSRS Engine)
              </h3>
              <p className="text-xs opacity-75 mt-0.5">
                Active recall review queue for {environment.vocabulary.length} saved lemmas.
              </p>
            </div>

            <button
              onClick={handleExportAnkiDeck}
              className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export All to Anki (.tsv)
            </button>
          </div>

          {activeCards.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-xs font-mono">
              No vocabulary cards added yet. Complete a writing session to extract cards!
            </div>
          ) : (
            <div className="max-w-lg mx-auto space-y-6">
              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] p-8 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >
                {!isFlipped ? (
                  <div className="space-y-2">
                    <div lang="da" className="text-3xl font-serif font-bold text-[var(--heading-color)]">
                      {currentCard.lemma}
                    </div>
                    <div className="text-xs font-mono text-[var(--accent-color)]">
                      {currentCard.ipa}
                    </div>
                    <span className="text-[10px] opacity-40 block pt-4 font-mono">
                      (Click to flip card)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xl font-serif font-bold text-[var(--heading-color)]">
                      {currentCard.meaning}
                    </div>
                    <div className="text-xs font-mono opacity-80">
                      Bridge: {currentCard.bridge}
                    </div>
                    {currentCard.notes && (
                      <div className="text-[11px] opacity-60 italic">{currentCard.notes}</div>
                    )}
                  </div>
                )}
              </div>

              {/* I Don't Know progressive flow for Flashcards */}
              {!isFlipped && (
                <div className="space-y-3">
                  {cardHelpStep === 'none' ? (
                    <div className="text-center">
                      <button
                        onClick={() => setCardHelpStep('suggestion')}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-amber-400 text-amber-400 font-mono text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        I don't know (Bridge Hint first)
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-start gap-2 text-amber-300 text-xs font-mono">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider block mb-1">
                            Etymological Bridge Clue:
                          </span>
                          <p>{currentCard.bridge}</p>
                          {currentCard.notes && (
                            <p className="text-[10px] opacity-75 mt-0.5">Note: {currentCard.notes}</p>
                          )}
                        </div>
                      </div>
                      {cardHelpStep === 'suggestion' && (
                        <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-mono text-amber-300/80">
                            Log to Uncertainty Queue & flip card?
                          </span>
                          <button
                            onClick={handleRevealCardSolution}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shrink-0"
                          >
                            Reveal & Log Item
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SRS Rating Buttons */}
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <button
                  onClick={() => handleGradeCard('again')}
                  className="py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all font-bold"
                >
                  Again
                  <span className="block text-[9px] opacity-60">&lt;1d</span>
                </button>
                <button
                  onClick={() => handleGradeCard('hard')}
                  className="py-2.5 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all font-bold"
                >
                  Hard
                  <span className="block text-[9px] opacity-60">1d</span>
                </button>
                <button
                  onClick={() => handleGradeCard('good')}
                  className="py-2.5 rounded-xl border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-all font-bold"
                >
                  Good
                  <span className="block text-[9px] opacity-60">3d</span>
                </button>
                <button
                  onClick={() => handleGradeCard('easy')}
                  className="py-2.5 rounded-xl border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-all font-bold"
                >
                  Easy
                  <span className="block text-[9px] opacity-60">7d+</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
