import { makeChildId, makeQuestionId, parsePartLabel } from "@/lib/topik";
import type {
  ExpressionItem,
  GrammarItem,
  Question,
  TopikLevel,
  TopikPart,
  VocabularyItem,
} from "@/types/topik";

interface ParseTopikMarkdownOptions {
  exam: number;
  level: TopikLevel;
  part?: TopikPart;
  now?: string;
}

type SectionKind = "vocabulary" | "grammar" | "expressions";

interface QuestionDraft {
  exam: number;
  level: TopikLevel;
  part: TopikPart;
  questionNo: number;
  title: string;
  vocabularyRows: string[][];
  grammarRows: string[][];
  expressionRows: string[][];
}

export interface TopikMarkdownInspection {
  normalizedMarkdown: string;
  recognizedQuestionHeadings: string[];
  questionCount: number;
  vocabularyCount: number;
  grammarCount: number;
  expressionsCount: number;
}

const SECTION_HEADING_MAP: Record<string, SectionKind> = {
  中高级词汇: "vocabulary",
  语法考点: "grammar",
  "惯用/常用表达": "expressions",
};

const VOCABULARY_HEADER = ["韩语", "中文"];
const GRAMMAR_HEADER = ["语法", "表达", "用法"];
const EXPRESSIONS_HEADER = ["韩语表达", "中文"];

function normalizeMarkdown(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/^\uFEFF/, "")
    .replace(/\\\|/g, "|")
    .replace(/\\-/g, "-")
    .replace(/\\\./g, ".")
    .replace(/\\_/g, "_")
    .replace(/\\\*/g, "*");
}

function sanitizeHeading(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isLikelyTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.includes("|");
}

function isSeparatorCell(cell: string) {
  return /^:?-{2,}:?$/.test(cell.replace(/\s+/g, ""));
}

function isSeparatorRow(cells: string[]) {
  return cells.length > 0 && cells.every(isSeparatorCell);
}

function includesHeader(cells: string[], header: string[]) {
  return header.every((name, index) => cells[index]?.includes(name));
}

function parseQuestionHeading(
  heading: string,
  fallbackPart?: TopikPart,
): { part: TopikPart; questionNo: number; title: string } | null {
  const cleaned = heading.replace(/\s+/g, " ").trim();
  const firstNumber = cleaned.match(/(\d+)\s*(?:번|题|號|号)?/);

  if (!firstNumber) {
    return null;
  }

  const explicitPart =
    parsePartLabel(cleaned) ??
    (cleaned.startsWith("听力")
      ? "listening"
      : cleaned.startsWith("阅读")
        ? "reading"
        : cleaned.startsWith("语法/写作") || cleaned.startsWith("语法写作")
          ? "grammar_writing"
          : null);

  const part = explicitPart ?? fallbackPart;

  if (!part) {
    return null;
  }

  if (!/(?:번|听力|阅读|语法\/写作|语法写作|~|～|-)/.test(cleaned)) {
    return null;
  }

  return {
    part,
    questionNo: Number(firstNumber[1]),
    title: cleaned,
  };
}

function buildVocabulary(questionId: string, rows: string[][]): VocabularyItem[] {
  return rows
    .filter(([korean, chinese]) => korean || chinese)
    .map(([korean = "", chinese = ""], index) => ({
      id: makeChildId(questionId, "vocabulary", index),
      questionId,
      korean,
      chinese,
      status: "new",
      reviewCount: 0,
      isFavorite: false,
    }));
}

function buildGrammar(questionId: string, rows: string[][]): GrammarItem[] {
  return rows
    .filter(([grammar, expression, usage]) => grammar || expression || usage)
    .map(([grammar = "", expression = "", usage = ""], index) => ({
      id: makeChildId(questionId, "grammar", index),
      questionId,
      grammar,
      expression,
      usage,
      status: "new",
      reviewCount: 0,
      isFavorite: false,
    }));
}

function buildExpressions(questionId: string, rows: string[][]): ExpressionItem[] {
  return rows
    .filter(([koreanExpression, chinese]) => koreanExpression || chinese)
    .map(([koreanExpression = "", chinese = ""], index) => ({
      id: makeChildId(questionId, "expressions", index),
      questionId,
      koreanExpression,
      chinese,
      status: "new",
      reviewCount: 0,
      isFavorite: false,
    }));
}

function finalizeQuestion(draft: QuestionDraft, now: string): Question {
  const questionId = makeQuestionId(
    draft.exam,
    draft.level,
    draft.part,
    draft.questionNo,
  );

  return {
    id: questionId,
    exam: draft.exam,
    level: draft.level,
    part: draft.part,
    questionNo: draft.questionNo,
    title: draft.title,
    vocabulary: buildVocabulary(questionId, draft.vocabularyRows),
    grammar: buildGrammar(questionId, draft.grammarRows),
    expressions: buildExpressions(questionId, draft.expressionRows),
    createdAt: now,
    updatedAt: now,
  };
}

function parseRowsForSection(lines: string[], startIndex: number, sectionKind: SectionKind) {
  const expectedHeader =
    sectionKind === "vocabulary"
      ? VOCABULARY_HEADER
      : sectionKind === "grammar"
        ? GRAMMAR_HEADER
        : EXPRESSIONS_HEADER;
  let headerFound = false;
  const rows: string[][] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "") {
      if (headerFound) {
        break;
      }

      index += 1;
      continue;
    }

    if (/^\s*#{1,6}\s+/.test(trimmed)) {
      break;
    }

    if (!isLikelyTableLine(trimmed)) {
      if (headerFound) {
        break;
      }

      index += 1;
      continue;
    }

    const cells = splitTableRow(trimmed);

    if (!headerFound) {
      if (includesHeader(cells, expectedHeader)) {
        headerFound = true;
      }

      index += 1;
      continue;
    }

    if (isSeparatorRow(cells)) {
      index += 1;
      continue;
    }

    rows.push(cells);
    index += 1;
  }

  return {
    rows,
    nextIndex: index - 1,
  };
}

function parseQuestions(
  markdown: string,
  options: ParseTopikMarkdownOptions,
): { questions: Question[]; recognizedQuestionHeadings: string[]; normalizedMarkdown: string } {
  const now = options.now ?? new Date().toISOString();
  const normalizedMarkdown = normalizeMarkdown(markdown);
  const lines = normalizedMarkdown.split("\n");
  const questions: Question[] = [];
  const recognizedQuestionHeadings: string[] = [];
  let currentQuestion: QuestionDraft | null = null;

  function flushQuestion() {
    if (!currentQuestion) {
      return;
    }

    questions.push(finalizeQuestion(currentQuestion, now));
    currentQuestion = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^\s*#{1,6}\s*(.+?)\s*$/);

    if (!headingMatch) {
      continue;
    }

    const heading = sanitizeHeading(headingMatch[1]);
    const sectionKind = SECTION_HEADING_MAP[heading];

    if (sectionKind && currentQuestion) {
      const parsedSection = parseRowsForSection(lines, index + 1, sectionKind);

      if (sectionKind === "vocabulary") {
        currentQuestion.vocabularyRows = parsedSection.rows;
      } else if (sectionKind === "grammar") {
        currentQuestion.grammarRows = parsedSection.rows;
      } else {
        currentQuestion.expressionRows = parsedSection.rows;
      }

      index = parsedSection.nextIndex;
      continue;
    }

    const questionHeading = parseQuestionHeading(heading, options.part);

    if (!questionHeading) {
      continue;
    }

    flushQuestion();
    recognizedQuestionHeadings.push(questionHeading.title);
    currentQuestion = {
      exam: options.exam,
      level: options.level,
      part: questionHeading.part,
      questionNo: questionHeading.questionNo,
      title: questionHeading.title,
      vocabularyRows: [],
      grammarRows: [],
      expressionRows: [],
    };
  }

  flushQuestion();

  return {
    questions,
    recognizedQuestionHeadings,
    normalizedMarkdown,
  };
}

export function inspectTopikMarkdown(
  markdown: string,
  options: ParseTopikMarkdownOptions,
): TopikMarkdownInspection {
  const { questions, recognizedQuestionHeadings, normalizedMarkdown } = parseQuestions(
    markdown,
    options,
  );

  return {
    normalizedMarkdown,
    recognizedQuestionHeadings,
    questionCount: questions.length,
    vocabularyCount: questions.reduce(
      (total, question) => total + question.vocabulary.length,
      0,
    ),
    grammarCount: questions.reduce((total, question) => total + question.grammar.length, 0),
    expressionsCount: questions.reduce(
      (total, question) => total + question.expressions.length,
      0,
    ),
  };
}

export function parseTopikMarkdown(
  markdown: string,
  options: ParseTopikMarkdownOptions,
): Question[] {
  return parseQuestions(markdown, options).questions;
}
