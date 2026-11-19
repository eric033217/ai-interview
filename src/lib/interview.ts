export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;
export const DEFAULT_QUESTIONS = 3;

export type ChatMessage = {
  role: "interviewer" | "candidate";
  content: string;
};

export type QuestionReview = {
  question: string;
  answer: string;
  feedback: string; // 對這題回答的點評
  betterAnswer: string; // 建議的較佳回答方式
};

export type Evaluation = {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
  questions: QuestionReview[];
};

export type InterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  messages: ChatMessage[];
};

export type InterviewResponse =
  | { type: "question"; question: string; questionNumber: number }
  | { type: "evaluation"; evaluation: Evaluation };
