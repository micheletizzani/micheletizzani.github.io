import React, { useState, useRef } from "react";
import {
  PenTool,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  Play,
  Square,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { requestWritingEvaluation, type WritingEvaluation } from "./llmClient";
import type { StudyEnvironment, VocabularyItem, ErrorLogItem, UncertaintyItem } from "./types";

interface PracticalViewProps {
  environment: StudyEnvironment;
  onUpdateEnvironment: (updated: StudyEnvironment) => void;
  apiKey: string;
  provider: "gemini" | "groq";
}

export const PracticalView: React.FC<PracticalViewProps> = ({ environment, onUpdateEnvironment, apiKey, provider }) => {
  const [activeTab, setActiveTab] = useState<"reading" | "writing" | "speaking">("writing");

  // Reading Studio state
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [comprehensionAnswer, setComprehensionAnswer] = useState<number | null>(null);
  const [readingHelpStep, setReadingHelpStep] = useState<"none" | "suggestion" | "solution">("none");

  // Writing Studio state
  const [userText, setUserText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<WritingEvaluation | null>(null);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [addedVocabCount, setAddedVocabCount] = useState(0);
  const [writingHelpStep, setWritingHelpStep] = useState<"none" | "suggestion" | "solution">("none");

  // Speaking Lab state
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [asrScore, setAsrScore] = useState<number | null>(null);
  const [targetSentence, setTargetSentence] = useState("I dag cykler jeg på arbejde, fordi jeg ikke har bil.");
  const [speakingHelpStep, setSpeakingHelpStep] = useState<"none" | "suggestion" | "solution">("none");
  const recognitionRef = useRef<any>(null);

  // Audio Recording (Self-Shadowing)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speakDanish = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "da-DK";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Sample Copenhagen Scenario Dialogue
  const readingDialogue = [
    {
      speaker: "Ekspedient (Netto)",
      danish: "Hej! Skal du have en pose med?",
      english: "Hi! Do you need a bag with you?",
      ipa: "[hɑj sɡ̊æl du hæˀ en ˈpʰoːsə mɛˀ]",
    },
    {
      speaker: "Kunde (Dig)",
      danish: "Nej tak, det behøver jeg ikke. Jeg har min egen rygsæk.",
      english: "No thanks, that need I not. I have my own backpack.",
      ipa: "[nɑj tˢɑɡ̊ d̥e b̥eˈhøˀvɐ jɑj ˈeɡ̊ə]",
    },
    {
      speaker: "Ekspedient",
      danish: "Det bliver 84 kroner. Vil du have kvitteringen?",
      english: "That will be 84 kroner. Do you want the receipt?",
      ipa: "[d̥e ˈb̥liˀɐ fiːɐˈfɪʁs kʁoːnɐ]",
    },
    {
      speaker: "Kunde",
      danish: "Ja tak, send den gerne på MobilePay.",
      english: "Yes please, send it happily on MobilePay.",
      ipa: "[jæ tˢɑɡ̊ sɛnˀ d̥ɛn ˈɡ̊ɛɐ̯nə]",
    },
  ];

  // Writing Submission Handler
  const handleEvaluateWriting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim()) return;

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const result = await requestWritingEvaluation(userText, { profile: environment.profile, vocabulary: environment.vocabulary }, apiKey, provider);
      setEvaluationResult(result);

      // Automatically log detected errors to the environment errorLog
      const newErrors: ErrorLogItem[] = [...environment.errorLog];
      result.corrections.forEach((corr) => {
        const existing = newErrors.find((e) => e.error.toLowerCase() === corr.error.toLowerCase());
        if (existing) {
          existing.count += 1;
          existing.lastSeen = new Date().toISOString().slice(0, 10);
        } else {
          newErrors.push({
            id: `err_${Date.now()}_${Math.random()}`,
            error: corr.error,
            correction: corr.correction,
            category: corr.category,
            explanation: corr.explanation,
            count: 1,
            lastSeen: new Date().toISOString().slice(0, 10),
          });
        }
      });

      onUpdateEnvironment({
        ...environment,
        errorLog: newErrors,
      });
    } catch (err: any) {
      alert("Error during evaluation: " + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddExtractedToVocabulary = () => {
    if (!evaluationResult?.extractedVocabulary) return;

    const existingLemmas = new Set(environment.vocabulary.map((v) => v.lemma.toLowerCase()));
    const newItems: VocabularyItem[] = [];

    evaluationResult.extractedVocabulary.forEach((item) => {
      if (!existingLemmas.has(item.lemma.toLowerCase())) {
        newItems.push({
          id: `voc_${Date.now()}_${Math.random()}`,
          lemma: item.lemma,
          ipa: item.ipa,
          meaning: item.meaning,
          bridge: item.bridge,
          hasStod: item.hasStod,
          hasSoftD: item.hasSoftD,
          dateAdded: new Date().toISOString().slice(0, 10),
          srs: {
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            dueDate: new Date().toISOString().slice(0, 10),
          },
        });
      }
    });

    onUpdateEnvironment({
      ...environment,
      vocabulary: [...environment.vocabulary, ...newItems],
    });
    setAddedVocabCount(newItems.length);
  };

  const handleCopyTsv = () => {
    if (!evaluationResult?.ankiTsv) return;
    navigator.clipboard.writeText(evaluationResult.ankiTsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2000);
  };

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use Chrome/Edge or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "da-DK";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscription("");
      setAsrScore(null);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscription(speechResult);

      // Compute objective phonemic match ratio
      const cleanTarget = targetSentence
        .toLowerCase()
        .replace(/[.,!?-]/g, "")
        .trim();
      const cleanRecognized = speechResult
        .toLowerCase()
        .replace(/[.,!?-]/g, "")
        .trim();

      const targetWords = cleanTarget.split(/\s+/);
      const recognizedWords = cleanRecognized.split(/\s+/);

      let matches = 0;
      targetWords.forEach((word: string) => {
        if (recognizedWords.includes(word)) matches++;
      });

      const score = Math.round((matches / Math.max(targetWords.length, recognizedWords.length)) * 100);
      setAsrScore(score);
    };

    recognition.onerror = (event: any) => {
      console.warn("ASR Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Shadowing Audio Recorder
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      alert("Could not access microphone: " + err);
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Uncertainty & Suggestion Handlers
  const handleRevealWritingSolution = () => {
    setWritingHelpStep("solution");
    const modelSentence = "I dag cykler jeg på arbejde. Desværre kan jeg ikke komme til mødet kl. 14, fordi jeg har en anden aftale.";

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: "Practical Writing",
      prompt: "Daily Challenge: 3-Sentence Workplace Message (V2 + Subordinate Negation)",
      suggestionHint: "Formula: [Tid] + [Verbum] + [Subjekt]... og ... fordi [Subjekt] + [IKKE] + [Verbum]. Bridges: møde, aftale, desværre.",
      solution: modelSentence,
      category: "Syntax / Production",
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const handleRevealReadingSolution = () => {
    setReadingHelpStep("solution");
    setComprehensionAnswer(1);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: "Practical Reading",
      prompt: "Comprehension: Why does the customer decline the bag in Netto?",
      suggestionHint: 'Customer states: "Nej tak, det behøver jeg ikke. Jeg har min egen rygsæk."',
      solution: "They brought their own backpack (egen rygsæk).",
      category: "Receptive Reading",
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const handleRevealSpeakingSolution = () => {
    setSpeakingHelpStep("solution");
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(targetSentence);
      u.lang = "da-DK";
      u.rate = 0.7; // Slow pedagogical rate
      window.speechSynthesis.speak(u);
    }

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: "Practical Speaking",
      prompt: `Pronunciation Target: "${targetSentence}"`,
      suggestionHint: 'Acoustic cues: Stød on "arbejde" [ˈɑːˌb̥ɑjˀdə], reduction in "cykler" [ˈsyɡ̊lɐ], and unvoiced stop in "ikke" [ˈeɡ̊ə].',
      solution: "Standard Copenhagen IPA: [i ˈdæˀ ˈsyɡ̊lɐ jɑj pʰɔ ˈɑːˌb̥ɑjˀdə fʌˈd̥iˀ jɑj ˈeɡ̊ə hɑˀ b̥iˀl]",
      category: "Phonetics & Intelligibility",
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Sub-Tabs */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("writing")}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "writing" ? "border-[var(--accent-color)] text-[var(--accent-color)]" : "border-transparent opacity-60 hover:opacity-100"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> Production Studio (Writing)
        </button>
        <button
          onClick={() => setActiveTab("speaking")}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "speaking" ? "border-[var(--accent-color)] text-[var(--accent-color)]" : "border-transparent opacity-60 hover:opacity-100"
          }`}
        >
          <Mic className="w-3.5 h-3.5" /> Acoustic Lab (ASR Dictation & Shadowing)
        </button>
        <button
          onClick={() => setActiveTab("reading")}
          className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "reading" ? "border-[var(--accent-color)] text-[var(--accent-color)]" : "border-transparent opacity-60 hover:opacity-100"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Graded Copenhagen Dialogues
        </button>
      </div>

      {/* 1. WRITING PRODUCTION STUDIO */}
      {activeTab === "writing" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">Daily Production Challenge</span>
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-1">Write a 3-Sentence Workplace Message</h3>
              <p className="text-xs opacity-75 mt-1 leading-relaxed">
                Prompt: Write to your Copenhagen colleague explaining that today you are riding your bike, but you cannot attend the 14:00 meeting
                because you have another obligation.
                <br />
                <b>Constraints:</b> Must use Verb-Second (V2) in the first sentence and subordinate word order (*... fordi jeg ikke...*) in the
                second.
              </p>
            </div>

            <form onSubmit={handleEvaluateWriting} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Skriv din tekst her... fx 'I dag cykler jeg på arbejde...'"
                  className="w-full p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs md:text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>

              {/* I Don't Know / Writing Scaffold Flow */}
              <div className="space-y-3">
                {writingHelpStep === "none" ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setWritingHelpStep("suggestion")}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />I don't know how to express this (Get Suggestion & Solution)
                    </button>
                  </div>
                ) : writingHelpStep === "suggestion" ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                    <div className="flex items-start gap-2 text-amber-300">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider block font-mono text-[10px] text-amber-400">
                          Syntax Blueprint & Lexical Bridges
                        </span>
                        <div className="mt-1 space-y-1 font-mono text-[11px] opacity-90">
                          <div>
                            • Sentence 1 (Main V2): <code>[I dag] + [cykler] + [jeg] + [på arbejde].</code>
                          </div>
                          <div>
                            • Sentence 2 (Compound + Subord): <code>[Desværre kan jeg ikke komme], fordi [jeg har en anden aftale].</code>
                          </div>
                          <div>
                            • Bridges: <i>desværre</i> (purtroppo/unfortunately), <i>aftale</i> (appointment), <i>møde</i> (meeting).
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                      <button
                        type="button"
                        onClick={() => setWritingHelpStep("none")}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[11px] opacity-80 hover:opacity-100"
                      >
                        Try Drafting with Blueprint
                      </button>
                      <button
                        type="button"
                        onClick={handleRevealWritingSolution}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reveal Model Solution & Log for Practice
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-green-400">Native Model Solution</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUserText("I dag cykler jeg på arbejde. Desværre kan jeg ikke komme til mødet kl. 14, fordi jeg har en anden aftale.");
                          setWritingHelpStep("none");
                        }}
                        className="text-[11px] font-mono text-[var(--accent-color)] hover:underline"
                      >
                        Insert Solution into My Text Box ↑
                      </button>
                    </div>
                    <p className="font-mono text-xs font-bold text-[var(--heading-color)]">
                      "I dag cykler jeg på arbejde. Desværre kan jeg ikke komme til mødet kl. 14, fordi jeg har en anden aftale."
                    </p>
                    <span className="text-[10px] font-mono text-green-400/80 block">
                      ✓ Automatically logged to your Uncertainty & Revision Queue in the Ledger.
                    </span>
                  </div>
                )}
              </div>

              {/* Self-Correction Checkpoints */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 opacity-80">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                  <span>
                    Self-Check: Is the verb in 2nd position after fronted adverbs? Did you place "ikke" before the verb in subordinate clauses?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating Syntax...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Submit for Pedagogical Audit
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* AI Feedback Display */}
            {evaluationResult && (
              <div className="mt-8 pt-6 border-t border-[var(--border-color)] space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-base text-[var(--heading-color)] mb-2">
                    Pedagogical Audit Report (Max 2 Priority Errors)
                  </h4>
                  <p className="text-xs opacity-75">{evaluationResult.feedback}</p>
                </div>

                {/* Corrections List */}
                <div className="space-y-3">
                  {evaluationResult.corrections.map((corr, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-red-400 line-through">{corr.error}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {corr.category}
                        </span>
                      </div>
                      <div className="font-mono text-green-400 font-bold">→ {corr.correction}</div>
                      <p className="opacity-80 text-[11px] leading-relaxed font-sans">{corr.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Anki Block & Add to Vocabulary */}
                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase opacity-60 block">Anki Card Output</span>
                    <span className="font-bold text-[var(--heading-color)]">
                      {evaluationResult.extractedVocabulary.length} new vocabulary items extracted
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddExtractedToVocabulary}
                      className="px-3 py-1.5 rounded-lg bg-[var(--accent-color)]/15 border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-medium hover:bg-[var(--accent-color)] hover:text-black transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {addedVocabCount > 0 ? `Added ${addedVocabCount} Items` : "Add to My Vocabulary"}
                    </button>
                    <button
                      onClick={handleCopyTsv}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedTsv ? "Copied TSV!" : "Copy Anki TSV"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACOUSTIC LAB (ASR & SHADOWING) */}
      {activeTab === "speaking" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mb-1">Objective Intelligibility Filter (Dictation Check)</h3>
            <p className="text-xs opacity-75 mb-6">
              Tests speech clarity using browser ASR (Speech-to-Text). If the model decodes what you said correctly without conversational LLM priors
              smoothing out your pronunciation, your speech is acoustically intelligible.
            </p>

            <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-1">
                Target Sentence to Read
              </span>
              <div className="flex items-center justify-between gap-4 font-mono text-sm font-bold text-[var(--heading-color)]">
                <span>{targetSentence}</span>
                <button
                  onClick={() => speakDanish(targetSentence)}
                  className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:text-[var(--accent-color)] shrink-0"
                  title="Listen to Target Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaking Pronunciation Help Flow */}
            <div className="mb-6 space-y-3">
              {speakingHelpStep === "none" ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSpeakingHelpStep("suggestion")}
                    className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />I don't know how to pronounce this (Acoustic Breakdown & Slow Audio)
                  </button>
                </div>
              ) : speakingHelpStep === "suggestion" ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                  <div className="flex items-start gap-2 text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block font-mono text-[10px] text-amber-400">
                        Copenhagen Phonetic Realization Notes
                      </span>
                      <div className="mt-1 space-y-1 font-mono text-[11px] opacity-90">
                        <div>
                          • <code>cykler</code>: starts with soft voiceless stop [ˈsyɡ̊lɐ], ending reduced to open [ɐ].
                        </div>
                        <div>
                          • <code>arbejde</code>: creaky stød vocal fry constriction on the diphthong [ˈɑːˌb̥ɑjˀdə].
                        </div>
                        <div>
                          • <code>ikke</code>: vowel is short [e] + unvoiced stop [ˈeɡ̊ə].
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                    <button
                      type="button"
                      onClick={() => setSpeakingHelpStep("none")}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[11px] opacity-80 hover:opacity-100"
                    >
                      Try Reading Again
                    </button>
                    <button
                      type="button"
                      onClick={handleRevealSpeakingSolution}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Play Slow Audio (0.7x) & Log for Shadowing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-green-400 font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Slow Reference Model: [i ˈdæˀ ˈsyɡ̊lɐ jɑj pʰɔ ˈɑːˌb̥ɑjˀdə fʌˈd̥iˀ jɑj ˈeɡ̊ə hɑˀ b̥iˀl]</span>
                  </div>
                  <span className="text-[10px] font-mono text-green-400/80 block">✓ Logged to your Uncertainty & Revision Queue in the Ledger.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <button
                onClick={toggleSpeechRecognition}
                className={`px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-[var(--accent-color)] text-black hover:opacity-95"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? "Listening (Click to Stop)..." : "Start Reading Dictation"}
              </button>

              {transcription && (
                <div className="text-xs font-mono opacity-80">
                  Transcribed: <b className="text-[var(--heading-color)]">"{transcription}"</b>
                </div>
              )}
            </div>

            {asrScore !== null && (
              <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase opacity-60 block">Acoustic Intelligibility Score</span>
                  <span className={`text-lg font-bold ${asrScore >= 80 ? "text-green-400" : asrScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                    {asrScore}%
                  </span>
                </div>
                <div className="text-right text-[11px] opacity-75 max-w-xs font-sans">
                  {asrScore >= 80
                    ? "Clear phonemic reproduction. Ready for native communication."
                    : "Phonemic divergence detected. Check stød and vowel reduction."}
                </div>
              </div>
            )}
          </div>

          {/* Self-Shadowing Dual-Recorder */}
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-base font-serif font-bold text-[var(--heading-color)] mb-2">Side-by-Side Shadowing Recorder</h4>
            <p className="text-xs opacity-75 mb-4">
              Play native audio, record yourself repeating the phrase, and compare your recording immediately to spot vowel reduction and intonation
              differences.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => speakDanish(targetSentence)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] flex items-center gap-2 font-medium"
              >
                <Volume2 className="w-4 h-4 text-[var(--accent-color)]" /> Play Reference Audio
              </button>

              <button
                onClick={isRecordingAudio ? stopRecordingAudio : startRecordingAudio}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  isRecordingAudio
                    ? "border-red-500 bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-[var(--bg-color)] border-[var(--border-color)] hover:border-red-400"
                }`}
              >
                {isRecordingAudio ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecordingAudio ? "Stop Recording" : "Record Your Voice"}
              </button>

              {audioUrl && (
                <div className="flex items-center gap-2">
                  <audio controls src={audioUrl} className="h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GRADED COPENHAGEN DIALOGUES */}
      {activeTab === "reading" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-color)] font-bold">
                  DU3 Module 1-2 Realistic Scenario
                </span>
                <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mt-0.5">At the Netto Supermarket (På indkøb)</h3>
              </div>
              <button
                onClick={() => speakDanish(readingDialogue.map((d) => d.danish).join(". "))}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" /> Play Full Dialogue
              </button>
            </div>

            {/* Dialogue Exchanges */}
            <div className="space-y-4 my-6">
              {readingDialogue.map((line, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase opacity-50 block mb-1">{line.speaker}</span>
                    <div lang="da" className="font-mono text-sm font-bold text-[var(--heading-color)]">
                      {line.danish}
                    </div>
                    <div className="text-[11px] opacity-60 mt-1">{line.english}</div>
                    <div className="text-[10px] font-mono text-[var(--accent-color)] opacity-75 mt-0.5">{line.ipa}</div>
                  </div>

                  <button
                    onClick={() => speakDanish(line.danish)}
                    className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:text-[var(--accent-color)] self-start sm:self-center shrink-0"
                    title="Pronounce sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Comprehension Check */}
            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
              <h4 className="text-sm font-serif font-bold text-[var(--heading-color)] mb-3">Comprehension Check:</h4>
              <p className="text-xs opacity-80 mb-3">Why does the customer decline the bag?</p>
              <div className="space-y-2 text-xs">
                {["They do not have enough money.", "They brought their own backpack (egen rygsæk).", "They forgot their MobilePay phone."].map(
                  (opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setComprehensionAnswer(oIdx)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        comprehensionAnswer === oIdx
                          ? oIdx === 1
                            ? "bg-green-500/10 border-green-500/40 text-green-400 font-bold"
                            : "bg-red-500/10 border-red-500/40 text-red-400"
                          : "bg-[var(--bg-color)] border-[var(--border-color)] opacity-80 hover:opacity-100"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>

              {/* I Don't Know in Reading */}
              <div className="mt-4 space-y-3">
                {readingHelpStep === "none" ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setReadingHelpStep("suggestion")}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />I don't know (Hint & Solution)
                    </button>
                  </div>
                ) : readingHelpStep === "suggestion" ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                    <div className="flex items-start gap-2 text-amber-300">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider block font-mono text-[10px] text-amber-400">
                          Reading Comprehension Hint
                        </span>
                        <p className="mt-1 opacity-90 leading-relaxed font-sans">
                          Look at the customer's response in line 2: <i>"Nej tak, det behøver jeg ikke. Jeg har min egen rygsæk."</i> What does{" "}
                          <b>"egen rygsæk"</b> mean in English?
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                      <button
                        type="button"
                        onClick={() => setReadingHelpStep("none")}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[11px] opacity-80 hover:opacity-100"
                      >
                        Try Answering Again
                      </button>
                      <button
                        type="button"
                        onClick={handleRevealReadingSolution}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reveal Solution & Log for Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-green-400 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct: "They brought their own backpack (egen rygsæk)."</span>
                    </div>
                    <span className="text-[10px] font-mono text-green-400/80 block">
                      ✓ Logged to your Uncertainty & Revision Queue in the Ledger.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
