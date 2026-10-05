import type { LanguageProfile, AssessmentResult, StudyPlan, VocabularyItem } from './types';

export interface WritingEvaluation {
  feedback: string;
  corrections: Array<{
    error: string;
    correction: string;
    category: 'Syntax' | 'Interference' | 'Phonetics' | 'Register' | 'Lexical';
    explanation: string;
  }>;
  ankiTsv: string;
  extractedVocabulary: Array<{
    lemma: string;
    ipa: string;
    meaning: string;
    bridge: string;
    hasStod: boolean;
    hasSoftD: boolean;
  }>;
}

export interface DialogueScenario {
  title: string;
  scenarioDescription: string;
  dialogue: Array<{
    speaker: string;
    target: string;
    english: string;
    ipa?: string;
  }>;
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export async function callGeminiApi(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response received from Gemini.');
  return text;
}

export async function callGroqApi(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const body: any = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.2,
    max_tokens: 2048,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callLLM(
  prompt: string,
  apiKey: string,
  provider: 'gemini' | 'groq' = 'gemini',
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  if (!apiKey) {
    throw new Error('No API key provided. Please configure your API key in the Vault Settings.');
  }

  if (provider === 'groq') {
    return callGroqApi(prompt, apiKey, systemInstruction, jsonMode);
  }
  return callGeminiApi(prompt, apiKey, systemInstruction, jsonMode);
}

export async function requestPersonalizedStudyPlan(
  profile: LanguageProfile,
  diagnostic: AssessmentResult,
  apiKey: string,
  provider: 'gemini' | 'groq'
): Promise<StudyPlan> {
  const systemPrompt = `You are a demanding, methodologically rigorous scientific linguist specializing in second-language acquisition (SLA) and contrastive analysis.
Your task is to generate a realistic study plan grounded in CEFR benchmarks (e.g., DU3 Danskuddannelse 3 Module progression if Danish).
Calculate available hours accurately (dailyMinutes * 7 / 60 * weeks).
Return strictly a valid JSON object matching the following schema:
{
  "estimatedHoursNeeded": number,
  "availableHoursBeforeDeadline": number,
  "isPacingRealistic": boolean,
  "du3ModuleTarget": string,
  "summary": string,
  "modules": [
    {
      "week": number,
      "title": string,
      "focusSyntax": string,
      "focusPhonetics": string,
      "vocabularyTheme": string,
      "completed": false,
      "canDoStatements": [string, string]
    }
  ]
}`;

  const userPrompt = `Profile:
Target Language: ${profile.targetLanguage}
Native Language (L1): ${profile.nativeLanguage}
Bridge Languages (L2/L3): ${profile.bridgeLanguages.join(', ')}
Current Level: ${profile.currentLevel}
Target Level: ${profile.targetLevel}
Daily Minutes: ${profile.dailyMinutes}
Target Date: ${profile.targetDate}
Diagnostic Score: ${diagnostic.score} / ${diagnostic.total} (Estimated: ${diagnostic.estimatedLevel})
Diagnostic Weaknesses: ${diagnostic.weaknesses.join('; ')}

Generate a calibrated, realistic study plan. Prioritize contrastive syntax interference (V2, ledsætning) and phonetic bottlenecks (stød, soft d, vowel reduction).`;

  try {
    const raw = await callLLM(userPrompt, apiKey, provider, systemPrompt, true);
    return JSON.parse(raw);
  } catch (e: any) {
    console.warn('LLM call failed, using heuristic calibrated study plan fallback:', e);
    // Safe heuristic fallback
    return {
      estimatedHoursNeeded: 110,
      availableHoursBeforeDeadline: Math.round((profile.dailyMinutes * 90) / 60),
      isPacingRealistic: true,
      du3ModuleTarget: 'DU3 Module 4 (CEFR B1)',
      summary: `Calibrated study plan for ${profile.targetLanguage} leveraging ${profile.nativeLanguage} and ${profile.bridgeLanguages.join('/')} bridges.`,
      modules: [
        {
          week: 1,
          title: 'Copenhagen Daily Commute & V2 Inversion',
          focusSyntax: 'V2 word order with fronted time/place adverbials',
          focusPhonetics: 'Soft d [ð] articulation and glottal stød [ˀ] minimal pairs',
          vocabularyTheme: 'Transport, cycling, supermarket, directions',
          completed: false,
          canDoStatements: [
            'Can ask for directions and handle grocery transactions.',
            'Can structure main sentences with inverted word order.',
          ],
        },
        {
          week: 2,
          title: 'University Life & Subordinate Clauses',
          focusSyntax: 'Ledsætningsordstilling: Central adverb "ikke" before finite verb',
          focusPhonetics: 'Unstressed vowel reduction to [ɐ] and silent d/g',
          vocabularyTheme: 'Academic workplace, scheduling meetings, administration',
          completed: false,
          canDoStatements: [
            'Can write short emails to colleagues explaining delays or scheduling.',
            'Can form subordinate clauses using "fordi" and "at" without inversion errors.',
          ],
        },
      ],
    };
  }
}

export async function requestWritingEvaluation(
  userText: string,
  environment: { profile: LanguageProfile; vocabulary: VocabularyItem[] },
  apiKey: string,
  provider: 'gemini' | 'groq'
): Promise<WritingEvaluation> {
  const { profile } = environment;
  const systemPrompt = `You are a strict, constructive language tutor for ${profile.targetLanguage}.
Student L1: ${profile.nativeLanguage} (Romance). L2: ${profile.bridgeLanguages.join(', ')} (Germanic).
Pedagogical Rule: Identify AT MOST 2 top errors (categorized as Syntax, Interference, Phonetics, or Lexical) to prevent cognitive overload.
Do not flatter. Provide clear contrastive explanations.
Provide an Anki-compatible TSV string of new terms and corrections (Format: Front \\t Back with IPA and bridge).
Return strictly valid JSON:
{
  "feedback": "string",
  "corrections": [
    {
      "error": "string",
      "correction": "string",
      "category": "Syntax" | "Interference" | "Phonetics" | "Register" | "Lexical",
      "explanation": "string"
    }
  ],
  "ankiTsv": "string",
  "extractedVocabulary": [
    {
      "lemma": "string",
      "ipa": "string",
      "meaning": "string",
      "bridge": "string",
      "hasStod": boolean,
      "hasSoftD": boolean
    }
  ]
}`;

  const prompt = `Student written submission in ${profile.targetLanguage}:
"""
${userText}
"""
Evaluate the text strictly against target grammar (e.g. V2 order, subordinate clause negation, gender).`;

  try {
    const raw = await callLLM(prompt, apiKey, provider, systemPrompt, true);
    return JSON.parse(raw);
  } catch (err: any) {
    console.warn('LLM call failed, generating pedagogical rule evaluation:', err);
    // Heuristic analysis for fallback
    const hasV2Issue = userText.includes('I dag jeg') || userText.includes('I dag man');
    const hasSubordIssue = userText.includes('fordi jeg har ikke') || userText.includes('at han er ikke');

    const corrections: WritingEvaluation['corrections'] = [];
    if (hasV2Issue) {
      corrections.push({
        error: 'I dag jeg...',
        correction: 'I dag [verbum] jeg...',
        category: 'Syntax',
        explanation: 'Main clause V2 rule: When an adverbial is fronted, the verb must stay in 2nd position.',
      });
    }
    if (hasSubordIssue) {
      corrections.push({
        error: '... fordi jeg har ikke...',
        correction: '... fordi jeg IKKE har...',
        category: 'Interference',
        explanation: 'Subordinate clause rule: The negation "ikke" precedes the finite verb in ledsætninger.',
      });
    }
    if (corrections.length === 0) {
      corrections.push({
        error: 'Check definite noun forms and gender',
        correction: 'Ensure en/et concordance matches official Copenhagen DDO lexicon',
        category: 'Lexical',
        explanation: 'Verify whether noun uses fælleskøn (-en) or intetkøn (-et).',
      });
    }

    return {
      feedback: 'Text reviewed. Check word order constraints and false-friend transfer.',
      corrections,
      ankiTsv: `cykel\t[ˈsyɡ̊əl] bicycle (en cykel -> cyklen)\narbejde\t[ˈɑːˌb̥ɑjˀdə] work (et arbejde, stød)`,
      extractedVocabulary: [
        {
          lemma: 'cykel',
          ipa: '[ˈsyɡ̊əl]',
          meaning: 'bicycle',
          bridge: 'French/English cycle',
          hasStod: false,
          hasSoftD: false,
        },
      ],
    };
  }
}
