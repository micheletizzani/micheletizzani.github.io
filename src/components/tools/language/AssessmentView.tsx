import React, { useState } from 'react';
import {
  ListChecks,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';
import { INITIAL_ASSESSMENT_QUESTIONS } from './defaultData';
import { requestPersonalizedStudyPlan } from './llmClient';
import type { StudyEnvironment, AssessmentResult, StudyPlan, WeeklyModule, UncertaintyItem } from './types';

interface AssessmentViewProps {
  environment: StudyEnvironment;
  onUpdateEnvironment: (updated: StudyEnvironment) => void;
  apiKey: string;
  provider: 'gemini' | 'groq';
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  environment,
  onUpdateEnvironment,
  apiKey,
  provider,
}) => {
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hintStep, setHintStep] = useState<'none' | 'suggestion' | 'solution'>('none');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  const questions = INITIAL_ASSESSMENT_QUESTIONS;
  const assessment = environment.assessment;
  const studyPlan = environment.studyPlan;

  const handleSelectOption = (optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleRevealAndLogSolution = () => {
    setHintStep('solution');
    const q = questions[currentQuestionIndex];
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = -1; // Unscored due to uncertainty
    setSelectedAnswers(updated);

    const newUncertainty: UncertaintyItem = {
      id: `unc_${Date.now()}_${Math.random()}`,
      section: 'Diagnostic Assessment',
      prompt: q.prompt,
      suggestionHint: q.hint || 'Review standard clause word order constraints.',
      solution: `Option ${String.fromCharCode(65 + q.correctIndex)}: ${q.options[q.correctIndex]}`,
      category: q.category,
      dateLogged: new Date().toISOString().slice(0, 10),
      resolved: false,
    };

    onUpdateEnvironment({
      ...environment,
      uncertaintyQueue: [...(environment.uncertaintyQueue || []), newUncertainty],
    });
  };

  const handleNextQuestion = () => {
    setHintStep('none');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      let correct = 0;
      selectedAnswers.forEach((ans, idx) => {
        if (ans === questions[idx].correctIndex) correct++;
      });

      const percentage = (correct / questions.length) * 100;
      let estimated = 'A0 Complete Beginner';
      if (percentage >= 80) estimated = 'A2 / DU3 Module 2';
      else if (percentage >= 50) estimated = 'A1.2 / DU3 Module 1';
      else if (percentage >= 25) estimated = 'A1.1 Beginner';

      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (selectedAnswers[0] === questions[0].correctIndex) {
        strengths.push('Understands main clause Verb-Second (V2) inversion.');
      } else {
        weaknesses.push('Struggles with V2 word order under adverbial fronting.');
      }

      if (selectedAnswers[1] === questions[1].correctIndex) {
        strengths.push('Mastered subordinate clause negation order (ledsætningsordstilling).');
      } else {
        weaknesses.push('Transfer error: places negation after verb in subordinate clauses.');
      }

      if (selectedAnswers[2] === questions[2].correctIndex) {
        strengths.push('Identified false-friend risks (frokost vs breakfast).');
      } else {
        weaknesses.push('Vulnerable to English/German false friends.');
      }

      const newAssessment: AssessmentResult = {
        completed: true,
        date: new Date().toISOString().slice(0, 10),
        score: correct,
        total: questions.length,
        estimatedLevel: estimated,
        strengths,
        weaknesses,
        recommendation: `Calibrate study towards ${environment.profile.targetLevel} focusing on syntax interference drills.`,
      };

      onUpdateEnvironment({
        ...environment,
        assessment: newAssessment,
      });

      setIsTakingTest(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!environment.assessment) return;
    setIsGeneratingPlan(true);
    setPlanError('');

    try {
      const generatedPlan = await requestPersonalizedStudyPlan(
        environment.profile,
        environment.assessment,
        apiKey,
        provider
      );

      onUpdateEnvironment({
        ...environment,
        studyPlan: generatedPlan,
      });
    } catch (err: any) {
      setPlanError(err.message || 'Failed to generate study plan.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleToggleCanDo = (moduleIdx: number, statementIdx: number) => {
    if (!studyPlan) return;
    const updatedModules = [...studyPlan.modules];
    const mod = updatedModules[moduleIdx];
    // Toggle completed state if all are marked
    mod.completed = !mod.completed;

    onUpdateEnvironment({
      ...environment,
      studyPlan: {
        ...studyPlan,
        modules: updatedModules,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Test / Placement Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-xs font-mono mb-3">
              <Award className="w-3.5 h-3.5" /> Diagnostic Assessment
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--heading-color)]">
              Linguistic Baseline & Placement
            </h2>
            <p className="text-sm opacity-75 mt-1 max-w-xl">
              Evaluates contrastive syntax (V2 inversion & subordinate clause word order), receptive vocabulary bridging, and phonemic awareness.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedAnswers([]);
              setCurrentQuestionIndex(0);
              setHintStep('none');
              setIsTakingTest(true);
            }}
            className="px-5 py-3 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            {assessment?.completed ? 'Retake Placement Test' : 'Start Placement Diagnostic'}
          </button>
        </div>

        {/* Diagnostic Results Card */}
        {assessment?.completed && !isTakingTest && (
          <div className="mt-8 pt-6 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
              <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">Estimated Level</span>
              <div className="text-xl font-bold font-serif text-[var(--accent-color)] mt-1">
                {assessment.estimatedLevel}
              </div>
              <div className="text-xs opacity-70 mt-1 font-mono">
                Diagnostic Score: {assessment.score} / {assessment.total} (
                {Math.round((assessment.score / assessment.total) * 100)}%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-green-400 font-bold">
                Observed Strengths
              </span>
              <ul className="mt-2 space-y-1 text-xs opacity-85">
                {assessment.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Interference Vulnerabilities
              </span>
              <ul className="mt-2 space-y-1 text-xs opacity-85">
                {assessment.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Placement Test Modal/Area */}
      {isTakingTest && (
        <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-color)] border-2 border-[var(--accent-color)] shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6 text-xs font-mono">
            <span className="text-[var(--accent-color)] font-bold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="opacity-60 uppercase">{questions[currentQuestionIndex].category}</span>
          </div>

          <h3 className="text-lg md:text-xl font-serif font-bold text-[var(--heading-color)] mb-6">
            {questions[currentQuestionIndex].prompt}
          </h3>

          <div className="space-y-3 mb-6">
            {questions[currentQuestionIndex].options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
              const isCorrectOpt = questions[currentQuestionIndex].correctIndex === optIdx;
              let btnClass = 'border-[var(--border-color)] bg-[var(--bg-secondary)] opacity-80 hover:opacity-100';

              if (hintStep === 'solution') {
                if (isCorrectOpt) {
                  btnClass = 'border-green-500 bg-green-500/15 text-green-300 font-bold shadow-md';
                } else if (isSelected) {
                  btnClass = 'border-red-500/50 bg-red-500/10 text-red-400 line-through';
                }
              } else if (isSelected) {
                btnClass = 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--heading-color)] font-medium shadow-sm';
              }

              return (
                <button
                  key={optIdx}
                  disabled={hintStep === 'solution'}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span lang={questions[currentQuestionIndex].category === 'syntax' ? 'da' : undefined}>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      hintStep === 'solution' && isCorrectOpt
                        ? 'border-green-500 bg-green-500 text-black font-bold'
                        : isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-black font-bold'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* I Don't Know / Suggestion Flow */}
          <div className="mb-6 space-y-3">
            {hintStep === 'none' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setHintStep('suggestion')}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  I don't know (Get Suggestion & Solution)
                </button>
              </div>
            )}

            {hintStep === 'suggestion' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                <div className="flex items-start gap-2 text-amber-300 font-medium">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block font-mono text-[10px] text-amber-400">
                      Pedagogical Suggestion / Structural Hint
                    </span>
                    <p className="mt-1 opacity-90 leading-relaxed font-sans">
                      {questions[currentQuestionIndex].hint || 'Analyze whether this is a main clause (V2) or subordinate clause.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => setHintStep('none')}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[11px] opacity-80 hover:opacity-100"
                  >
                    Try Answering with Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={handleRevealAndLogSolution}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reveal Solution & Log for Revision
                  </button>
                </div>
              </div>
            )}

            {hintStep === 'solution' && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Answer: Option {String.fromCharCode(65 + questions[currentQuestionIndex].correctIndex)}</span>
                </div>
                <p className="text-[11px] opacity-90 font-sans leading-relaxed text-[var(--text-color)]">
                  {questions[currentQuestionIndex].explanation}
                </p>
                <span className="text-[10px] font-mono text-green-400/80 block pt-1">
                  ✓ Automatically logged to your Uncertainty & Revision Queue in the Ledger.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => setIsTakingTest(false)}
              className="px-4 py-2 rounded-xl text-xs opacity-60 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              disabled={selectedAnswers[currentQuestionIndex] === undefined && hintStep !== 'solution'}
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Personalized Study Plan Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--accent-color)]" />
              Syllabus & Progression Roadmap
            </h3>
            <p className="text-xs opacity-75 mt-0.5">
              Grounded in {environment.profile.targetLevel} benchmarks with contrastive pacing.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan || !assessment?.completed}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono font-medium text-[var(--text-color)] hover:text-[var(--accent-color)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingPlan ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-color)]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
            )}
            {studyPlan ? 'Recalibrate Plan via LLM' : 'Generate Study Plan (LLM)'}
          </button>
        </div>

        {planError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {planError}
          </div>
        )}

        {studyPlan && (
          <div className="space-y-6">
            {/* Feasibility Metric Bar */}
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-4">
                <div>
                  <span className="opacity-60 block text-[10px]">Estimated Hours Needed</span>
                  <span className="font-bold text-[var(--heading-color)]">
                    {studyPlan.estimatedHoursNeeded}h
                  </span>
                </div>
                <div className="border-l border-[var(--border-color)] pl-4">
                  <span className="opacity-60 block text-[10px]">Hours Before Deadline</span>
                  <span className="font-bold text-[var(--heading-color)]">
                    {studyPlan.availableHoursBeforeDeadline}h
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    studyPlan.isPacingRealistic
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {studyPlan.isPacingRealistic ? 'Pacing Realistic' : 'Pacing Tight / High Risk'}
                </span>
              </div>
            </div>

            {/* Weekly Modules */}
            <div className="space-y-4">
              {studyPlan.modules.map((mod, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all ${
                    mod.completed
                      ? 'bg-[var(--bg-secondary)]/60 border-green-500/30 opacity-80'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-mono text-xs font-bold flex items-center justify-center">
                        W{mod.week}
                      </span>
                      <h4 className="text-base font-serif font-bold text-[var(--heading-color)]">
                        {mod.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleToggleCanDo(idx, 0)}
                      className={`text-xs px-3 py-1 rounded-lg border font-mono transition-all flex items-center gap-1.5 ${
                        mod.completed
                          ? 'bg-green-500/15 border-green-500/40 text-green-400'
                          : 'border-[var(--border-color)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {mod.completed ? 'Module Completed' : 'Mark Completed'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                    <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-1">
                        Syntax Focus
                      </span>
                      <p className="opacity-85">{mod.focusSyntax}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-color)] font-bold block mb-1">
                        Phonetics Focus
                      </span>
                      <p className="opacity-85">{mod.focusPhonetics}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-2">
                      Competency Can-Do Checklist
                    </span>
                    <div className="space-y-1.5">
                      {mod.canDoStatements.map((canDo, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-2 text-xs opacity-90 p-2 rounded-lg bg-[var(--bg-color)]/50"
                        >
                          <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                          <span>{canDo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
