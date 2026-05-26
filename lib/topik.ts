import type {
  Question,
  ReviewSource,
  SmartReviewContentType,
  SmartReviewPhase,
  StudyStatus,
  TopikLevel,
  TopikPart,
} from "@/types/topik";

export const LEVEL_OPTIONS: TopikLevel[] = ["intermediate", "advanced"];
export const PART_OPTIONS: TopikPart[] = [
  "reading",
  "listening",
  "grammar_writing",
];
export const STATUS_OPTIONS: StudyStatus[] = ["new", "learning", "mastered"];

export const LEVEL_LABELS: Record<TopikLevel, string> = {
  intermediate: "中级",
  advanced: "高级",
};

export const PART_LABELS: Record<TopikPart, string> = {
  listening: "听力",
  reading: "阅读",
  grammar_writing: "语法/写作",
};

export const STATUS_LABELS: Record<StudyStatus, string> = {
  new: "new",
  learning: "learning",
  mastered: "mastered",
};

export function makeQuestionId(
  exam: number,
  level: TopikLevel,
  part: TopikPart,
  questionNo: number,
) {
  return `${exam}-${level}-${part}-${questionNo}`;
}

export function makeChildId(questionId: string, category: string, index: number) {
  return `${questionId}-${category}-${index + 1}`;
}

export function formatQuestionMeta(question: Pick<Question, "exam" | "part" | "questionNo">) {
  return `第${question.exam}届 · ${PART_LABELS[question.part]} · ${question.questionNo}번`;
}

export function formatReviewSource(source: ReviewSource) {
  return `第${source.exam}届 / ${PART_LABELS[source.part]} / ${source.questionNo}번`;
}

export function parsePartLabel(value: string) {
  const normalized = value.replace(/\s+/g, "");

  if (normalized.startsWith("阅读")) {
    return "reading" satisfies TopikPart;
  }

  if (normalized.startsWith("听力")) {
    return "listening" satisfies TopikPart;
  }

  if (normalized.startsWith("语法/写作") || normalized.startsWith("语法写作")) {
    return "grammar_writing" satisfies TopikPart;
  }

  return null;
}

export function getStatusClasses(status: StudyStatus) {
  if (status === "mastered") {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (status === "learning") {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

export function getNextStatus(status: StudyStatus): StudyStatus {
  if (status === "new") {
    return "learning";
  }

  if (status === "learning") {
    return "mastered";
  }

  return "new";
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function diffDateKeysInDays(fromDateKey: string, toDateKey: string) {
  const oneDay = 24 * 60 * 60 * 1000;
  const fromDate = parseLocalDateKey(fromDateKey);
  const toDate = parseLocalDateKey(toDateKey);

  return Math.floor((toDate.getTime() - fromDate.getTime()) / oneDay);
}

export function getSmartPhaseLabel(phase: SmartReviewPhase) {
  if (phase === "new") {
    return "今日新项";
  }

  if (phase === "review") {
    return "5天循环复习";
  }

  return "低频抽查";
}

export function getSmartContentLabel(contentType: SmartReviewContentType) {
  if (contentType === "vocabulary") {
    return "词汇";
  }

  if (contentType === "grammar") {
    return "语法";
  }

  return "表达";
}
