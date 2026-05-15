import { z } from "zod";

export interface Token {
  text: string;
  meaning: string;
  colorIndex: number;
  reading?: string; // furigana/hiragana reading for kanji characters
}

export interface QuizOption {
  text: string;
  romaji: string;
  english: string;
  tokens: Token[];
  romajiTokens?: Token[];
  englishTokens?: Token[];
}

export interface QuizQuestion {
  question: string; // plain text for fallback
  questionTokens?: Token[]; // tokenized with furigana + color coding
  questionRomajiTokens?: SimpleToken[]; // color-coded romaji tokens for question
  questionEnglishTokens?: SimpleToken[]; // color-coded english tokens for question
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
  topic?: string;
}

export interface SimpleToken {
  text: string;
  meaning?: string;
  colorIndex: number;
  reading?: string;
}

const TokenSchema = z.union([
  z.string(),
  z.object({
    text: z.string().default(""),
    meaning: z.string().nullable().optional().default(""),
    colorIndex: z.number().nullable().optional().default(0),
    reading: z.string().nullable().optional().default(""),
  })
]).transform((val) => {
  if (typeof val === "string") {
    return { text: val, meaning: "", colorIndex: 0, reading: "" };
  }
  return {
    text: val.text ?? "",
    meaning: val.meaning ?? "",
    colorIndex: val.colorIndex ?? 0,
    reading: val.reading ?? "",
  };
});

// Lighter token schema for romaji/english (no meaning required)
export const SimpleTokenSchema = z.union([
  z.string(),
  z.object({
    text: z.string().default(""),
    reading: z.string().nullable().optional().default(""),
    meaning: z.string().nullable().optional().default(""),
    colorIndex: z.number().nullable().optional().default(0),
  })
]).transform((val) => {
  if (typeof val === "string") {
    return { text: val, reading: "", meaning: "", colorIndex: 0 };
  }
  return {
    text: val.text ?? "",
    reading: val.reading ?? "",
    meaning: val.meaning ?? "",
    colorIndex: val.colorIndex ?? 0,
  };
});

// Flexible schema that accepts either a plain string or an object for question
const QuestionTextSchema = z.union([z.string(), z.object({ text: z.string() })]).transform((val) => {
  if (typeof val === "string") return val;
  return val.text;
});

const OptionSchema = z.object({
  text: z.string(),
  romaji: z.string().optional().default(""),
  english: z.string().optional().default(""),
  tokens: z.array(TokenSchema),
  romajiTokens: z.array(SimpleTokenSchema).optional().default([]),
  englishTokens: z.array(SimpleTokenSchema).optional().default([]),
});

const QuestionSchema = z.object({
  question: QuestionTextSchema,
  questionTokens: z.array(TokenSchema).optional().default([]),
  questionRomajiTokens: z.array(SimpleTokenSchema).optional().default([]),
  questionEnglishTokens: z.array(SimpleTokenSchema).optional().default([]),
  options: z.array(OptionSchema).length(4),
  correctIndex: z.number().min(0).max(3).nullable().default(0),
  explanation: z.string().nullable().default("No explanation provided."),
  topic: z.string().optional().default("New Topic"),
});


export const QuizZodSchema = z.object({
  questions: z.array(QuestionSchema),
});

/**
 * Shuffles the options of each question and updates the correctIndex.
 * This ensures that even if the AI has a bias (e.g. always picking index 0),
 * the final quiz presented to the user is randomized.
 */
export const shuffleQuizQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  return questions.map((q) => {
    const safeCorrectIndex = q.correctIndex ?? 0;
    const originalCorrectOption = q.options[safeCorrectIndex];
    
    // Create a copy of options and shuffle them
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      
      // Swap with temporary variable to satisfy TypeScript's noUncheckedIndexedAccess
      const itemI = shuffledOptions[i];
      const itemJ = shuffledOptions[j];
      
      if (itemI !== undefined && itemJ !== undefined) {
        shuffledOptions[i] = itemJ;
        shuffledOptions[j] = itemI;
      }
    }

    // Find the new index of the correct option
    const newCorrectIndex = shuffledOptions.findIndex(
      (opt) => opt === originalCorrectOption
    );

    return {
      ...q,
      options: shuffledOptions,
      correctIndex: newCorrectIndex === -1 ? 0 : newCorrectIndex,
    };
  });
};

const SYSTEM_INSTRUCTION = `You are a professional language tutor specializing in immersive language learning.

CRITICAL RULES FOR QUESTION GENERATION:
1. THE CHALLENGE: The goal is to test the learner's deep understanding. 
2. FILL-IN-THE-BLANKS: For "Multiple Choice" questions, replace the target word/phrase with "____".
   - DO NOT include the answer in the question text.
   - The blank "____" MUST be a separate token in "questionTokens".
3. DISTRACTOR QUALITY: 
   - DO NOT use distractors that are visually similar but semantically unrelated.
   - DO use distractors that are grammatically plausible but contextually wrong.
   - For Kanji-based languages, avoid distractors that just look like the correct Kanji.
4. TOKEN INTEGRITY & ALIGNMENT:
   - "questionTokens", "questionRomajiTokens", and "questionEnglishTokens" MUST have the EXACT SAME number of tokens.
   - They must be aligned such that index 0 in each array refers to the same word/part.
   - The "reading" and "meaning" of the "____" token in "questionTokens" MUST be "____" or empty (do not leak the answer).
   - FOR NON-BLANK TOKENS: NEVER use "____" as the meaning or reading. Provide the actual meaning.
   - Color indexes (0-5) must be consistent for the same concept across all arrays.
7. SYMBOL-BY-SYMBOL BREAKDOWN: 
   - Every sentence (question and all options) MUST be broken down into 'tokens'.
   - Each token MUST be an object with: 'text', 'reading', 'meaning', and 'colorIndex'.
   - NEVER return a token as a plain string; always use an object.
   - Use 'colorIndex' to group related words.

5. NO LEAKAGE: Never put the correct answer in the explanation in a way that reveals it before the user answers.
6. NATIVE-LIKE PHRASING: Sentences should sound like something a native speaker would actually say.

For the QUESTION:
- "question": Target language sentence with "____".
- "questionTokens": Full tokens including the "____" token.
- "explanation": Detailed linguistic explanation in the learner's native language.

For each OPTION:
- "text": The candidate word/phrase.
- "tokens": Detailed breakdown (essential for complex phrases).
- "romaji": Pronunciation.
- "english": Direct translation.

Return ONLY valid JSON matching the schema.`;

const PROMPT_TEMPLATE = (params: Record<string, string | number | boolean>) => {
  const parts = [
    `Level: ${params.level}`,
    `Topic: ${params.topic}`,
    `Native language of learner: ${params.nativeLanguage}`,
    `Target language: ${params.language} — ALL questions and options MUST be written in this language.`,
    `Dialect: ${params.regionalDialect}`,
    `Focus Area: ${params.focusArea}`,
    `Learning Goal: ${params.learningGoal}`,
    `Tone: ${params.tone}`,
    `Scenario: ${params.learningScenario}`,
    `Difficulty: ${params.difficultyMode}`,
    `Explanation Depth: ${params.explanationDepth}`,
    `Include Phonetics: ${params.includePhonetics}`,
    `Quiz Format: ${params.quizFormat}`,
    `Number of questions: ${params.count}`,
  ];

  return `Create a quiz with these parameters:\n${parts.join("\n")}\n\nIMPORTANT: Write every question and every option in the TARGET LANGUAGE (${params.language}). Never write questions or options in English. Provide romaji for pronunciation and english as a translation below each option.`;
};

export const generateQuiz = async (
  apiKey: string,
  language: string,
  level: string,
  topic: string,
  count: number = 5,
  focusArea: string = "Vocabulary",
  quizFormat: string = "Multiple Choice",
  tone: string = "Casual",
  learningScenario: string = "Daily Life",
  difficultyMode: string = "Standard",
  includePhonetics: boolean = true,
  nativeLanguage: string = "English",
  learningGoal: string = "Conversational",
  regionalDialect: string = "Standard",
  explanationDepth: string = "Detailed",
): Promise<QuizQuestion[]> => {
  const params = {
    level,
    topic,
    nativeLanguage,
    language,
    regionalDialect,
    focusArea,
    learningGoal,
    tone,
    learningScenario,
    difficultyMode,
    includePhonetics,
    quizFormat,
    explanationDepth,
    count: String(count),
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [
        { role: "user", parts: [{ text: PROMPT_TEMPLATE(params) }] },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
  };

  let response: Response | null = null;
  let lastError: Error | null = null;
  let delay = 1500;
  
  for (let i = 0; i < 3; i++) {
    try {
      response = await fetch(url, options);
      if (response.ok) break;

      const err = await response.json().catch(() => ({}));
      lastError = new Error(err.error?.message || `API error ${response.status}`);
      
      // Do not retry client errors except 429 Too Many Requests
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw lastError;
      }
    } catch (e: any) {
      lastError = e;
    }

    if (i < 2) {
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error("Failed to connect to the Gemini API.");
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown fences if present
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const raw = JSON.parse(text);
  const dataParsed = Array.isArray(raw) ? { questions: raw } : raw;
  const questions = QuizZodSchema.parse(dataParsed).questions as QuizQuestion[];
  return shuffleQuizQuestions(questions);
};

