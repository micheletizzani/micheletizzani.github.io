export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguageProfile {
  targetLanguage: string;
  nativeLanguage: string; // L1 (e.g. Italian)
  bridgeLanguages: string[]; // L2/L3 (e.g. English)
  currentLevel: string;
  targetLevel: string; // e.g. "CEFR B1 (DU3 Module 4)"
  dailyMinutes: number;
  targetDate: string; // YYYY-MM-DD
  startDate: string;
  totalStudyHours: number;
}

export interface VocabularyItem {
  id: string;
  lemma: string;
  ipa: string;
  meaning: string;
  bridge: string; // Etymology/Sound shift
  hasStod: boolean;
  hasSoftD: boolean;
  notes?: string;
  dateAdded: string;
  srs: {
    interval: number; // in days
    repetitions: number;
    easeFactor: number; // default 2.5
    dueDate: string; // YYYY-MM-DD
  };
}

export interface ErrorLogItem {
  id: string;
  error: string;
  correction: string;
  category: 'Syntax' | 'Interference' | 'Phonetics' | 'Register' | 'Lexical';
  explanation: string;
  count: number;
  lastSeen: string;
}

export interface WeeklyModule {
  week: number;
  title: string;
  focusSyntax: string;
  focusPhonetics: string;
  vocabularyTheme: string;
  completed: boolean;
  canDoStatements: string[];
}

export interface StudyPlan {
  estimatedHoursNeeded: number;
  availableHoursBeforeDeadline: number;
  isPacingRealistic: boolean;
  modules: WeeklyModule[];
  du3ModuleTarget: string;
  summary: string;
}

export interface AssessmentQuestion {
  id: string;
  category: 'syntax' | 'vocabulary' | 'interference' | 'phonetics';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface UncertaintyItem {
  id: string;
  section: string;
  prompt: string;
  userQuery?: string;
  suggestionHint: string;
  solution: string;
  category?: string;
  dateLogged: string;
  resolved: boolean;
}

export interface AssessmentResult {
  completed: boolean;
  date: string;
  score: number;
  total: number;
  estimatedLevel: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface StudyEnvironment {
  id: string;
  title: string;
  profile: LanguageProfile;
  assessment?: AssessmentResult;
  studyPlan?: StudyPlan;
  vocabulary: VocabularyItem[];
  errorLog: ErrorLogItem[];
  uncertaintyQueue?: UncertaintyItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultData {
  version: number;
  environments: StudyEnvironment[];
  activeEnvironmentId: string;
  apiKey: string;
  provider: 'gemini' | 'groq';
  model: string;
  lastUnlocked: string;
}

export interface MinimalPair {
  id: string;
  word1: string;
  ipa1: string;
  meaning1: string;
  word2: string;
  ipa2: string;
  meaning2: string;
  phonemicDifference: string;
}

export interface SyntaxPuzzle {
  id: string;
  sentenceType: 'main' | 'subordinate';
  english: string;
  italianBridge?: string;
  targetTokens: string[];
  correctOrder: string[];
  ruleExplanation: string;
  hint?: string;
}
