export type ActiveTab =
  | 'notes'
  | 'concept'
  | 'quiz'
  | 'questions'
  | 'code'
  | 'planner'
  | 'saved';

export interface NoteDefinition {
  term: string;
  definition: string;
}

export interface NoteCoreConcept {
  heading: string;
  points: string[];
  example?: string;
  formula?: string;
}

export interface NotePracticalExample {
  title: string;
  scenario: string;
  stepByStepExplanation: string[];
}

export interface NoteFlashcard {
  question: string;
  answer: string;
}

export interface StudyNotesData {
  id?: string;
  createdAt?: string;
  title: string;
  subject: string;
  summary: string;
  keyDefinitions: NoteDefinition[];
  coreConcepts: NoteCoreConcept[];
  practicalExamples: NotePracticalExample[];
  examTipsAndPitfalls: string[];
  quickFlashcards: NoteFlashcard[];
}

export interface ConceptExplanationStage {
  stage: string;
  details: string;
}

export interface ConceptMisconception {
  myth: string;
  reality: string;
}

export interface ConceptExplanationData {
  id?: string;
  createdAt?: string;
  title: string;
  oneSentenceDefinition: string;
  everydayAnalogy: string;
  coreExplanation: ConceptExplanationStage[];
  mentalModelDiagram?: string;
  commonMisconceptions: ConceptMisconception[];
  realWorldApplication: string;
  quickCheckQuestion: {
    question: string;
    hint: string;
    answer: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  topicTag: string;
}

export interface QuizData {
  id?: string;
  createdAt?: string;
  quizTitle: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export interface ShortQuestion {
  marks: 2;
  question: string;
  modelAnswer: string;
  keyKeywords: string[];
}

export interface MediumQuestion {
  marks: 5;
  question: string;
  modelAnswer: string;
  diagramOrStepAdvice: string;
}

export interface LongQuestion {
  marks: 10;
  question: string;
  rubricBreakdown: string[];
  modelAnswerOutline: string;
}

export interface PracticeQuestionsData {
  id?: string;
  createdAt?: string;
  topic: string;
  subject: string;
  examTips: string;
  shortQuestions: ShortQuestion[];
  mediumQuestions: MediumQuestion[];
  longQuestions: LongQuestion[];
  highYieldRevisionChecklist: string[];
}

export interface CodeLineExplanation {
  lineRange: string;
  codeSnippet: string;
  explanation: string;
}

export interface CodeExplainerData {
  id?: string;
  createdAt?: string;
  detectedLanguage: string;
  summary: string;
  lineByLine: CodeLineExplanation[];
  complexity: {
    timeComplexity: string;
    spaceComplexity: string;
    complexityExplanation: string;
  };
  beginnerPitfalls: string[];
  keyTakeaways: string[];
  optimizedAlternative?: {
    code: string;
    whatWasImproved: string;
  };
}

export interface PlannerSession {
  timeSlot: string;
  subject: string;
  topic: string;
  technique: string;
  pomodoros: string;
  actionableGoal: string;
}

export interface PlannerDay {
  dayNumber: number;
  dayLabel: string;
  focusSubject: string;
  sessions: PlannerSession[];
  dailyReviewTip: string;
}

export interface StudyPlanData {
  id?: string;
  createdAt?: string;
  planTitle: string;
  totalHours: number;
  strategySummary: string;
  dailySchedule: PlannerDay[];
  weeklyMilestones: Array<{ day: number; checkpoint: string }>;
  burnoutPreventionTips: string[];
}

export interface SavedItem {
  id: string;
  type: ActiveTab;
  title: string;
  subject?: string;
  date: string;
  data: any;
}
