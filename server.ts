import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAIClient(): GoogleGenAI {
  if (!ai) {
    const freshKey = process.env.GEMINI_API_KEY;
    if (freshKey) {
      ai = new GoogleGenAI({
        apiKey: freshKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      return ai;
    }
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return ai;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Helper to call Gemini with retry and fallback on transient errors (503/429)
async function generateWithRetry(client: GoogleGenAI, params: any, maxRetries = 2): Promise<any> {
  const modelsToTry = [params.model || 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await client.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        attempt++;
        lastError = err;
        const isTransient =
          err?.status === 503 ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand') ||
          err?.status === 429 ||
          err?.message?.includes('429');

        if (isTransient && attempt < maxRetries) {
          const delay = 1000 * attempt;
          console.warn(`Transient error on ${model} (attempt ${attempt}), retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          break; // Try fallback model next
        }
      }
    }
  }

  throw lastError;
}

// Helper to clean JSON string from markdown code fence if present
function parseGeminiJSON(text: string | undefined): any {
  if (!text) {
    throw new Error('Empty response received from Gemini.');
  }
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(clean);
}

// 1. AI Notes Generator
app.post('/api/generate-notes', async (req, res) => {
  try {
    const { topic, subject, targetAudience = '1st & 2nd Year College', detailLevel = 'Comprehensive' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const client = getAIClient();
    const prompt = `You are a top-tier university academic professor and peer tutor for 1st and 2nd year college students.
Generate clean, highly structured, clear, and comprehensive study notes for:
Topic: "${topic}"
Subject/Field: "${subject || 'General STEM / Higher Education'}"
Target Level: "${targetAudience}"
Detail Style: "${detailLevel}"

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "Clear Topic Title",
  "subject": "Subject Name",
  "summary": "2-3 concise sentences summarizing what this is, why it matters in exams, and core intuition.",
  "keyDefinitions": [
    { "term": "Term Name", "definition": "Clear, precise academic definition with context" }
  ],
  "coreConcepts": [
    {
      "heading": "Concept Subheading",
      "points": ["Key bullet point 1", "Key bullet point 2", "Key bullet point 3"],
      "example": "Intuitive concrete example or application",
      "formula": "Optional mathematical formula or pseudocode notation if applicable"
    }
  ],
  "practicalExamples": [
    {
      "title": "Example Scenario or Problem",
      "scenario": "The problem statement or real-world situation",
      "stepByStepExplanation": ["Step 1 explanation", "Step 2 explanation", "Step 3 conclusion"]
    }
  ],
  "examTipsAndPitfalls": [
    "Common student mistake to avoid during exams",
    "High-yield point frequently tested in semester papers"
  ],
  "quickFlashcards": [
    { "question": "Quick recall question", "answer": "Concise high-yield answer" }
  ]
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating notes:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate notes. Please check API key and try again.',
    });
  }
});

// 2. Concept Explainer
app.post('/api/explain-concept', async (req, res) => {
  try {
    const { concept, difficulty = 'Standard (College Level)', context = '' } = req.body;
    if (!concept) {
      return res.status(400).json({ error: 'Concept name is required.' });
    }

    const client = getAIClient();
    const prompt = `You are a master educator specializing in demystifying complex college subjects for undergraduate students.
Explain the following concept:
Concept: "${concept}"
Target Difficulty/Style: "${difficulty}"
Additional Context or Specific Doubt: "${context || 'None provided'}"

Provide an intuitive breakdown that gives immediate clarity without losing academic rigor.
Respond ONLY with valid JSON matching this exact structure:
{
  "title": "Clean Concept Name",
  "oneSentenceDefinition": "A crisp, memorable definition.",
  "everydayAnalogy": "A brilliant, relatable everyday analogy (e.g. comparing computer memory to a kitchen pantry, or electric potential to water pressure).",
  "coreExplanation": [
    { "stage": "1. What is actually happening?", "details": "Explanation paragraph" },
    { "stage": "2. Why does it work this way?", "details": "Explanation paragraph" },
    { "stage": "3. The formal mechanism", "details": "Explanation paragraph" }
  ],
  "mentalModelDiagram": "A clean ASCII/text diagram illustrating the mechanism or relationship (e.g. [Input] -> [Processing] -> [Output] or flow arrows).",
  "commonMisconceptions": [
    { "myth": "What students commonly mistakenly assume", "reality": "Why that is wrong and how to think about it correctly" }
  ],
  "realWorldApplication": "How engineers, scientists, or industry professionals use this concept today.",
  "quickCheckQuestion": {
    "question": "A quick concept test question to verify comprehension",
    "hint": "Gentle nudge",
    "answer": "Correct answer with brief reasoning"
  }
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error explaining concept:', error);
    res.status(500).json({
      error: error.message || 'Failed to explain concept.',
    });
  }
});

// 3. AI Quiz Generator
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, subject = '', numberOfQuestions = 5, difficulty = 'Intermediate' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for quiz generation.' });
    }

    const client = getAIClient();
    const count = Math.min(Math.max(Number(numberOfQuestions) || 5, 3), 10);

    const prompt = `You are a university exam creator designing a high-quality practice quiz for 1st and 2nd year college students.
Create exactly ${count} multiple choice questions (MCQs) for:
Topic: "${topic}"
Subject: "${subject || 'College Academic Curriculum'}"
Difficulty: "${difficulty}"

Rules:
- Questions must test conceptual understanding, problem-solving, and edge cases, not mere trivia.
- Exactly 4 plausible options per question (index 0, 1, 2, 3).
- Provide the correct 0-based index.
- Provide a clear explanation of WHY the correct answer is right and why distractors fail.
- Provide an educational hint.

Respond ONLY with valid JSON matching this exact structure:
{
  "quizTitle": "Quiz on ${topic}",
  "totalQuestions": ${count},
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Detailed explanation of the correct answer.",
      "hint": "A helpful clue without giving away the full answer directly.",
      "topicTag": "Specific subtopic"
    }
  ]
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz.',
    });
  }
});

// 4. Practice Questions (Exam Revision)
app.post('/api/practice-questions', async (req, res) => {
  try {
    const { topic, subject = '', examType = 'Semester Midterm & Final Exams' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for practice questions.' });
    }

    const client = getAIClient();
    const prompt = `You are an experienced college exam examiner crafting essential revision and practice questions for university students.
Topic: "${topic}"
Subject: "${subject || 'Undergraduate Curriculum'}"
Exam Focus: "${examType}"

Generate exam-style questions organized by standard academic marks distribution:
- 2-Mark Questions (Short, conceptual definitions / differentiating terms)
- 5-Mark Questions (Detailed explanations, numericals or derivations)
- 10-Mark Questions (Comprehensive essay/case study/design problem with rubric)
- High-Yield Revision Checklist

Respond ONLY with valid JSON matching this structure:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "examTips": "Key strategy for scoring top marks on this topic in university exams.",
  "shortQuestions": [
    {
      "marks": 2,
      "question": "Concise question testing definition or key distinction?",
      "modelAnswer": "Clean model answer (2-3 sentences with exact technical keywords).",
      "keyKeywords": ["Keyword 1", "Keyword 2"]
    }
  ],
  "mediumQuestions": [
    {
      "marks": 5,
      "question": "Standard 5-mark question (explain working, compare two algorithms, derive formula)?",
      "modelAnswer": "Comprehensive model answer with structured sub-points.",
      "diagramOrStepAdvice": "Specific note on whether a diagram, circuit, or flowchart is expected by examiners."
    }
  ],
  "longQuestions": [
    {
      "marks": 10,
      "question": "Comprehensive in-depth question (design, step-by-step proof, architecture analysis)?",
      "rubricBreakdown": ["Introduction & Definition (2 Marks)", "Working / Core Mechanism (4 Marks)", "Proof / Implementation (2 Marks)", "Limitations & Applications (2 Marks)"],
      "modelAnswerOutline": "Key structural points required to get full 10/10 marks."
    }
  ],
  "highYieldRevisionChecklist": [
    "Checklist item 1 that examiners frequently test",
    "Checklist item 2",
    "Checklist item 3"
  ]
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating practice questions:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate practice questions.',
    });
  }
});

// 5. Code Explainer
app.post('/api/explain-code', async (req, res) => {
  try {
    const { code, language = 'auto', focus = 'Comprehensive Line-by-Line' } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code snippet is required.' });
    }

    const client = getAIClient();
    const prompt = `You are a patient senior computer science instructor tutoring 1st and 2nd-year programming students.
Analyze and explain the following code snippet:
Language: "${language}"
Focus: "${focus}"

Code:
\`\`\`${language}
${code}
\`\`\`

Explain this code clearly for a beginner to intermediate college student.
Respond ONLY with valid JSON matching this exact structure:
{
  "detectedLanguage": "Programming language name",
  "summary": "Plain English summary of what this code does and its primary objective.",
  "lineByLine": [
    { "lineRange": "Line 1-3", "codeSnippet": "code snippet", "explanation": "What this section does and why it is written this way" }
  ],
  "complexity": {
    "timeComplexity": "e.g. O(n log n)",
    "spaceComplexity": "e.g. O(1) auxiliary",
    "complexityExplanation": "Clear justification of why this is the time and space complexity."
  },
  "beginnerPitfalls": [
    "Common student mistake (off-by-one errors, null pointers, variable shadowing, memory leaks, etc.)"
  ],
  "keyTakeaways": [
    "Core programming pattern or idiom used here"
  ],
  "optimizedAlternative": {
    "code": "Cleaner, more idiomatic or optimized version of the code",
    "whatWasImproved": "Bullet points on what makes this improved version better"
  }
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error explaining code:', error);
    res.status(500).json({
      error: error.message || 'Failed to explain code.',
    });
  }
});

// 6. Study Planner
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { subjects, daysAvailable = 7, hoursPerDay = 3, goal = 'Midterm Prep', targetWeaknesses = '' } = req.body;
    if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
      return res.status(400).json({ error: 'At least one subject is required.' });
    }

    const client = getAIClient();
    const subjectList = Array.isArray(subjects) ? subjects.join(', ') : subjects;

    const prompt = `You are an expert college academic counselor and study productivity coach.
Create a realistic, scientifically structured study schedule (using spaced repetition, active recall, and Pomodoro blocks) for a 1st/2nd year undergraduate student.

Parameters:
Subjects: "${subjectList}"
Total Days Available: ${daysAvailable} days
Study Hours Available per Day: ${hoursPerDay} hours/day
Target Goal: "${goal}"
Specific Focus / Weak Areas: "${targetWeaknesses || 'General comprehensive mastery'}"

Create a structured day-by-day timetable for the specified days (up to 7 detailed days).
Respond ONLY with valid JSON matching this exact structure:
{
  "planTitle": "Study Plan Title",
  "totalHours": ${daysAvailable * hoursPerDay},
  "strategySummary": "Overview of the pacing strategy, explaining how spaced repetition and active review are distributed.",
  "dailySchedule": [
    {
      "dayNumber": 1,
      "dayLabel": "Day 1: Foundation & High-Yield Core",
      "focusSubject": "Subject Name",
      "sessions": [
        {
          "timeSlot": "Block 1 (90 mins)",
          "subject": "Subject Name",
          "topic": "Specific Topic",
          "technique": "Active Recall / Problem Solving / Notes Revision",
          "pomodoros": "3 x 25m focus + 5m breaks",
          "actionableGoal": "Concrete milestone to complete by end of block"
        }
      ],
      "dailyReviewTip": "Quick end-of-day self-test habit"
    }
  ],
  "weeklyMilestones": [
    { "day": 3, "checkpoint": "Mid-point diagnostic self-quiz completed" }
  ],
  "burnoutPreventionTips": [
    "Practical advice for sleep, hydration, and memory consolidation"
  ]
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const parsed = parseGeminiJSON(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate study plan.',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
