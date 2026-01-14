
export enum SuggestionCategory {
  GRAMMAR = 'Grammar',
  STYLE = 'Style',
  CLARITY = 'Clarity',
  TONE = 'Tone',
  VOCABULARY = 'Vocabulary'
}

export interface Suggestion {
  id: string;
  original: string;
  replacement: string;
  explanation: string;
  category: SuggestionCategory;
  index: number;
}

export interface ReadabilityStats {
  score: number;
  level: string;
  wordCount: number;
  sentenceCount: number;
  readingTime: string;
}

export interface ProofreadingResult {
  correctedText: string;
  suggestions: Suggestion[];
  stats: ReadabilityStats;
  overallTone: string;
}

export type EditorialTone = 'Professional' | 'Casual' | 'Academic' | 'Creative' | 'Urgent';
