export type TopikLevel = "intermediate" | "advanced";
export type TopikPart = "listening" | "reading" | "grammar_writing";
export type StudyStatus = "new" | "learning" | "mastered";

export interface VocabularyItem {
  id: string;
  questionId: string;
  korean: string;
  chinese: string;
  status: StudyStatus;
  reviewCount: number;
  isFavorite: boolean;
}

export interface GrammarItem {
  id: string;
  questionId: string;
  grammar: string;
  expression: string;
  usage: string;
  status: StudyStatus;
  reviewCount: number;
  isFavorite: boolean;
}

export interface ExpressionItem {
  id: string;
  questionId: string;
  koreanExpression: string;
  chinese: string;
  status: StudyStatus;
  reviewCount: number;
  isFavorite: boolean;
}

export interface Question {
  id: string;
  exam: number;
  level: TopikLevel;
  part: TopikPart;
  questionNo: number;
  title: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarItem[];
  expressions: ExpressionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  exam?: number;
  level?: TopikLevel;
  part?: TopikPart;
}

export interface StudyStats {
  questions: number;
  vocabulary: number;
  grammar: number;
  expressions: number;
}

export interface ReviewSource {
  exam: number;
  level: TopikLevel;
  part: TopikPart;
  questionNo: number;
  title: string;
}

export interface VocabularyMemoryProgress {
  vocabularyId: string;
  introducedOn: string;
  lastReviewedOn: string;
}

export interface GrammarMemoryProgress {
  grammarId: string;
  introducedOn: string;
  lastReviewedOn: string;
}

export interface ExpressionMemoryProgress {
  expressionId: string;
  introducedOn: string;
  lastReviewedOn: string;
}

export type VocabularyReviewItem = VocabularyItem & {
  source: ReviewSource;
};

export type GrammarReviewItem = GrammarItem & {
  source: ReviewSource;
};

export type ExpressionReviewItem = ExpressionItem & {
  source: ReviewSource;
};

export type SmartReviewPhase = "new" | "review" | "refresh";
export type SmartReviewContentType = "vocabulary" | "grammar" | "expressions";

export interface SmartReviewMemory {
  memory: {
    introducedOn: string;
    lastReviewedOn: string;
    daysSinceIntroduced: number;
    cycleDay: number;
    phase: SmartReviewPhase;
  };
}

export type SmartVocabularyReviewItem = VocabularyReviewItem &
  SmartReviewMemory & {
    contentType: "vocabulary";
  };

export type SmartGrammarReviewItem = GrammarReviewItem &
  SmartReviewMemory & {
    contentType: "grammar";
  };

export type SmartExpressionReviewItem = ExpressionReviewItem &
  SmartReviewMemory & {
    contentType: "expressions";
  };

export type SmartReviewItem =
  | SmartVocabularyReviewItem
  | SmartGrammarReviewItem
  | SmartExpressionReviewItem;

export interface SmartReviewPlan {
  date: string;
  newCount: number;
  reviewCount: number;
  refreshCount: number;
  vocabularyCount: number;
  grammarCount: number;
  expressionsCount: number;
  items: SmartReviewItem[];
}

export interface ExportedTopikData {
  questions: Question[];
  vocabulary: VocabularyItem[];
  vocabularyMemory: VocabularyMemoryProgress[];
  grammarMemory: GrammarMemoryProgress[];
  grammar: GrammarItem[];
  expressionMemory: ExpressionMemoryProgress[];
  expressions: ExpressionItem[];
  exportedAt: string;
}
