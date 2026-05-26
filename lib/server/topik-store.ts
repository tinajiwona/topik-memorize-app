import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { diffDateKeysInDays, getLocalDateKey } from "@/lib/topik";
import type {
  ExportedTopikData,
  ExpressionItem,
  ExpressionMemoryProgress,
  ExpressionReviewItem,
  GrammarMemoryProgress,
  GrammarItem,
  GrammarReviewItem,
  Question,
  QuestionFilters,
  ReviewSource,
  SmartReviewContentType,
  SmartReviewItem,
  SmartReviewPlan,
  StudyStats,
  StudyStatus,
  VocabularyItem,
  VocabularyMemoryProgress,
  VocabularyReviewItem,
} from "@/types/topik";

type QuestionRow = {
  id: string;
  exam: number;
  level: Question["level"];
  part: Question["part"];
  question_no: number;
  title: string;
  created_at: string;
  updated_at: string;
};

type VocabularyRow = {
  id: string;
  question_id: string;
  korean: string;
  chinese: string;
  status: StudyStatus;
  review_count: number;
  is_favorite: boolean;
};

type GrammarRow = {
  id: string;
  question_id: string;
  grammar: string;
  expression: string;
  usage: string;
  status: StudyStatus;
  review_count: number;
  is_favorite: boolean;
};

type ExpressionRow = {
  id: string;
  question_id: string;
  korean_expression: string;
  chinese: string;
  status: StudyStatus;
  review_count: number;
  is_favorite: boolean;
};

type VocabularyMemoryRow = {
  vocabulary_id: string;
  introduced_on: string;
  last_reviewed_on: string;
};

type GrammarMemoryRow = {
  grammar_id: string;
  introduced_on: string;
  last_reviewed_on: string;
};

type ExpressionMemoryRow = {
  expression_id: string;
  introduced_on: string;
  last_reviewed_on: string;
};

function sortQuestions(left: Question, right: Question) {
  if (left.exam !== right.exam) {
    return left.exam - right.exam;
  }

  if (left.level !== right.level) {
    return left.level.localeCompare(right.level);
  }

  if (left.part !== right.part) {
    return left.part.localeCompare(right.part);
  }

  return left.questionNo - right.questionNo;
}

function getTrailingNumber(id: string) {
  const match = id.match(/-(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function sortChildRows<T extends { id: string }>(rows: T[]) {
  return [...rows].sort((left, right) => {
    const leftIndex = getTrailingNumber(left.id);
    const rightIndex = getTrailingNumber(right.id);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.id.localeCompare(right.id);
  });
}

function mapQuestionRow(row: QuestionRow): Question {
  return {
    id: row.id,
    exam: row.exam,
    level: row.level,
    part: row.part,
    questionNo: row.question_no,
    title: row.title,
    vocabulary: [],
    grammar: [],
    expressions: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVocabularyRow(row: VocabularyRow): VocabularyItem {
  return {
    id: row.id,
    questionId: row.question_id,
    korean: row.korean,
    chinese: row.chinese,
    status: row.status,
    reviewCount: row.review_count,
    isFavorite: row.is_favorite,
  };
}

function mapGrammarRow(row: GrammarRow): GrammarItem {
  return {
    id: row.id,
    questionId: row.question_id,
    grammar: row.grammar,
    expression: row.expression,
    usage: row.usage,
    status: row.status,
    reviewCount: row.review_count,
    isFavorite: row.is_favorite,
  };
}

function mapExpressionRow(row: ExpressionRow): ExpressionItem {
  return {
    id: row.id,
    questionId: row.question_id,
    koreanExpression: row.korean_expression,
    chinese: row.chinese,
    status: row.status,
    reviewCount: row.review_count,
    isFavorite: row.is_favorite,
  };
}

function mapVocabularyMemoryRow(row: VocabularyMemoryRow): VocabularyMemoryProgress {
  return {
    vocabularyId: row.vocabulary_id,
    introducedOn: row.introduced_on,
    lastReviewedOn: row.last_reviewed_on,
  };
}

function mapGrammarMemoryRow(row: GrammarMemoryRow): GrammarMemoryProgress {
  return {
    grammarId: row.grammar_id,
    introducedOn: row.introduced_on,
    lastReviewedOn: row.last_reviewed_on,
  };
}

function mapExpressionMemoryRow(row: ExpressionMemoryRow): ExpressionMemoryProgress {
  return {
    expressionId: row.expression_id,
    introducedOn: row.introduced_on,
    lastReviewedOn: row.last_reviewed_on,
  };
}

function pickSource(question: Question): ReviewSource {
  return {
    exam: question.exam,
    level: question.level,
    part: question.part,
    questionNo: question.questionNo,
    title: question.title,
  };
}

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function loadQuestionsWithItems(questionRows: QuestionRow[]) {
  if (questionRows.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const questionIds = questionRows.map((row) => row.id);
  const [vocabularyRows, grammarRows, expressionRows] = await Promise.all([
    unwrap(
      supabase
        .from("vocabulary")
        .select("*")
        .in("question_id", questionIds)
        .order("id", { ascending: true }),
    ),
    unwrap(
      supabase
        .from("grammar")
        .select("*")
        .in("question_id", questionIds)
        .order("id", { ascending: true }),
    ),
    unwrap(
      supabase
        .from("expressions")
        .select("*")
        .in("question_id", questionIds)
        .order("id", { ascending: true }),
    ),
  ]);

  const vocabularyByQuestion = new Map<string, VocabularyItem[]>();
  for (const row of sortChildRows((vocabularyRows ?? []) as VocabularyRow[])) {
    const item = mapVocabularyRow(row);
    vocabularyByQuestion.set(item.questionId, [
      ...(vocabularyByQuestion.get(item.questionId) ?? []),
      item,
    ]);
  }

  const grammarByQuestion = new Map<string, GrammarItem[]>();
  for (const row of sortChildRows((grammarRows ?? []) as GrammarRow[])) {
    const item = mapGrammarRow(row);
    grammarByQuestion.set(item.questionId, [
      ...(grammarByQuestion.get(item.questionId) ?? []),
      item,
    ]);
  }

  const expressionsByQuestion = new Map<string, ExpressionItem[]>();
  for (const row of sortChildRows((expressionRows ?? []) as ExpressionRow[])) {
    const item = mapExpressionRow(row);
    expressionsByQuestion.set(item.questionId, [
      ...(expressionsByQuestion.get(item.questionId) ?? []),
      item,
    ]);
  }

  return questionRows
    .map((row) => {
      const question = mapQuestionRow(row);
      return {
        ...question,
        vocabulary: vocabularyByQuestion.get(question.id) ?? [],
        grammar: grammarByQuestion.get(question.id) ?? [],
        expressions: expressionsByQuestion.get(question.id) ?? [],
      } satisfies Question;
    })
    .sort(sortQuestions);
}

function getContentPriority(contentType: SmartReviewContentType) {
  if (contentType === "vocabulary") {
    return 0;
  }

  if (contentType === "grammar") {
    return 1;
  }

  return 2;
}

function getPhaseWeight(phase: SmartReviewItem["memory"]["phase"]) {
  if (phase === "review") {
    return 0;
  }

  if (phase === "refresh") {
    return 1;
  }

  return 2;
}

function getRefreshProbability(reviewCount: number) {
  if (reviewCount >= 20) {
    return 0.06;
  }

  if (reviewCount >= 12) {
    return 0.1;
  }

  if (reviewCount >= 8) {
    return 0.16;
  }

  return 0.24;
}

function getRefreshScore(id: string, dateKey: string) {
  let hash = 0;
  const seed = `${dateKey}:${id}`;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }

  return hash / 100000;
}

function makeSmartItem(
  contentType: SmartReviewContentType,
  item: VocabularyItem | GrammarItem | ExpressionItem,
  source: ReviewSource,
  memory: SmartReviewItem["memory"],
): SmartReviewItem {
  if (contentType === "vocabulary") {
    return {
      ...(item as VocabularyItem),
      contentType,
      source,
      memory,
    };
  }

  if (contentType === "grammar") {
    return {
      ...(item as GrammarItem),
      contentType,
      source,
      memory,
    };
  }

  return {
    ...(item as ExpressionItem),
    contentType,
    source,
    memory,
  };
}

async function getVocabularyItems() {
  const supabase = getSupabaseAdmin();
  const rows = (await unwrap(
    supabase.from("vocabulary").select("*").order("id", { ascending: true }),
  )) as VocabularyRow[] | null;

  return sortChildRows(rows ?? []).map(mapVocabularyRow);
}

async function getGrammarItems() {
  const supabase = getSupabaseAdmin();
  const rows = (await unwrap(
    supabase.from("grammar").select("*").order("id", { ascending: true }),
  )) as GrammarRow[] | null;

  return sortChildRows(rows ?? []).map(mapGrammarRow);
}

async function getExpressionItems() {
  const supabase = getSupabaseAdmin();
  const rows = (await unwrap(
    supabase.from("expressions").select("*").order("id", { ascending: true }),
  )) as ExpressionRow[] | null;

  return sortChildRows(rows ?? []).map(mapExpressionRow);
}

async function updateItemStatus(
  kind: "vocabulary" | "grammar" | "expressions",
  id: string,
  status: StudyStatus,
) {
  const supabase = getSupabaseAdmin();

  if (kind === "vocabulary") {
    const current = (await unwrap(
      supabase
        .from("vocabulary")
        .select("review_count")
        .eq("id", id)
        .maybeSingle(),
    )) as Pick<VocabularyRow, "review_count"> | null;

    if (!current) {
      return;
    }

    await unwrap(
      supabase
        .from("vocabulary")
        .update({
          status,
          review_count: current.review_count + 1,
        })
        .eq("id", id),
    );
    return;
  }

  if (kind === "grammar") {
    const current = (await unwrap(
      supabase
        .from("grammar")
        .select("review_count")
        .eq("id", id)
        .maybeSingle(),
    )) as Pick<GrammarRow, "review_count"> | null;

    if (!current) {
      return;
    }

    await unwrap(
      supabase
        .from("grammar")
        .update({
          status,
          review_count: current.review_count + 1,
        })
        .eq("id", id),
    );
    return;
  }

  const current = (await unwrap(
    supabase
      .from("expressions")
      .select("review_count")
      .eq("id", id)
      .maybeSingle(),
  )) as Pick<ExpressionRow, "review_count"> | null;

  if (!current) {
    return;
  }

  await unwrap(
    supabase
      .from("expressions")
      .update({
        status,
        review_count: current.review_count + 1,
      })
      .eq("id", id),
  );
}

async function updateItemFavorite(
  kind: "vocabulary" | "grammar" | "expressions",
  id: string,
  isFavorite: boolean,
) {
  const supabase = getSupabaseAdmin();

  if (kind === "vocabulary") {
    await unwrap(
      supabase
        .from("vocabulary")
        .update({ is_favorite: isFavorite })
        .eq("id", id),
    );
    return;
  }

  if (kind === "grammar") {
    await unwrap(
      supabase
        .from("grammar")
        .update({ is_favorite: isFavorite })
        .eq("id", id),
    );
    return;
  }

  await unwrap(
    supabase
      .from("expressions")
      .update({ is_favorite: isFavorite })
      .eq("id", id),
  );
}

export const topikStore = {
  async importQuestions(questions: Question[]) {
    const supabase = getSupabaseAdmin();

    for (const question of questions) {
      const existing = (await unwrap(
        supabase
          .from("questions")
          .select("*")
          .eq("exam", question.exam)
          .eq("level", question.level)
          .eq("part", question.part)
          .eq("question_no", question.questionNo)
          .maybeSingle(),
      )) as QuestionRow | null;

      if (existing) {
        await unwrap(supabase.from("questions").delete().eq("id", existing.id));
      }

      const createdAt = existing?.created_at ?? question.createdAt;
      const updatedAt = new Date().toISOString();

      await unwrap(
        supabase.from("questions").insert({
          id: question.id,
          exam: question.exam,
          level: question.level,
          part: question.part,
          question_no: question.questionNo,
          title: question.title,
          created_at: createdAt,
          updated_at: updatedAt,
        }),
      );

      if (question.vocabulary.length > 0) {
        await unwrap(
          supabase.from("vocabulary").insert(
            question.vocabulary.map((item) => ({
              id: item.id,
              question_id: item.questionId,
              korean: item.korean,
              chinese: item.chinese,
              status: item.status,
              review_count: item.reviewCount,
              is_favorite: item.isFavorite,
            })),
          ),
        );
      }

      if (question.grammar.length > 0) {
        await unwrap(
          supabase.from("grammar").insert(
            question.grammar.map((item) => ({
              id: item.id,
              question_id: item.questionId,
              grammar: item.grammar,
              expression: item.expression,
              usage: item.usage,
              status: item.status,
              review_count: item.reviewCount,
              is_favorite: item.isFavorite,
            })),
          ),
        );
      }

      if (question.expressions.length > 0) {
        await unwrap(
          supabase.from("expressions").insert(
            question.expressions.map((item) => ({
              id: item.id,
              question_id: item.questionId,
              korean_expression: item.koreanExpression,
              chinese: item.chinese,
              status: item.status,
              review_count: item.reviewCount,
              is_favorite: item.isFavorite,
            })),
          ),
        );
      }
    }
  },

  async getAllQuestions(filters: QuestionFilters = {}) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("questions").select("*").order("exam", { ascending: true }).order("level", { ascending: true }).order("part", { ascending: true }).order("question_no", { ascending: true });

    if (filters.exam !== undefined) {
      query = query.eq("exam", filters.exam);
    }

    if (filters.level !== undefined) {
      query = query.eq("level", filters.level);
    }

    if (filters.part !== undefined) {
      query = query.eq("part", filters.part);
    }

    const rows = (await unwrap(query)) as QuestionRow[] | null;
    return loadQuestionsWithItems(rows ?? []);
  },

  async getQuestionById(id: string) {
    const supabase = getSupabaseAdmin();
    const row = (await unwrap(
      supabase.from("questions").select("*").eq("id", id).maybeSingle(),
    )) as QuestionRow | null;

    if (!row) {
      return null;
    }

    const questions = await loadQuestionsWithItems([row]);
    return questions[0] ?? null;
  },

  async getStats(): Promise<StudyStats> {
    const [questions, vocabulary, grammar, expressions] = await Promise.all([
      this.getAllQuestions(),
      getVocabularyItems(),
      getGrammarItems(),
      getExpressionItems(),
    ]);

    return {
      questions: questions.length,
      vocabulary: vocabulary.length,
      grammar: grammar.length,
      expressions: expressions.length,
    };
  },

  async updateVocabularyStatus(id: string, status: StudyStatus) {
    await updateItemStatus("vocabulary", id, status);
  },

  async updateGrammarStatus(id: string, status: StudyStatus) {
    await updateItemStatus("grammar", id, status);
  },

  async updateExpressionStatus(id: string, status: StudyStatus) {
    await updateItemStatus("expressions", id, status);
  },

  async toggleVocabularyFavorite(id: string, isFavorite: boolean) {
    await updateItemFavorite("vocabulary", id, isFavorite);
  },

  async toggleGrammarFavorite(id: string, isFavorite: boolean) {
    await updateItemFavorite("grammar", id, isFavorite);
  },

  async toggleExpressionFavorite(id: string, isFavorite: boolean) {
    await updateItemFavorite("expressions", id, isFavorite);
  },

  async clearExamData(exam: number) {
    const supabase = getSupabaseAdmin();
    await unwrap(supabase.from("questions").delete().eq("exam", exam));
  },

  async exportAllData(): Promise<ExportedTopikData> {
    const supabase = getSupabaseAdmin();
    const [
      questions,
      vocabularyRows,
      grammarRows,
      expressionRows,
      vocabularyMemoryRows,
      grammarMemoryRows,
      expressionMemoryRows,
    ] = await Promise.all([
      this.getAllQuestions(),
      unwrap(supabase.from("vocabulary").select("*").order("id", { ascending: true })),
      unwrap(supabase.from("grammar").select("*").order("id", { ascending: true })),
      unwrap(supabase.from("expressions").select("*").order("id", { ascending: true })),
      unwrap(supabase.from("vocabulary_memory").select("*").order("vocabulary_id", { ascending: true })),
      unwrap(supabase.from("grammar_memory").select("*").order("grammar_id", { ascending: true })),
      unwrap(supabase.from("expression_memory").select("*").order("expression_id", { ascending: true })),
    ]);

    return {
      questions,
      vocabulary: sortChildRows((vocabularyRows ?? []) as VocabularyRow[]).map(mapVocabularyRow),
      vocabularyMemory: ((vocabularyMemoryRows ?? []) as VocabularyMemoryRow[]).map(
        mapVocabularyMemoryRow,
      ),
      grammar: sortChildRows((grammarRows ?? []) as GrammarRow[]).map(mapGrammarRow),
      grammarMemory: ((grammarMemoryRows ?? []) as GrammarMemoryRow[]).map(mapGrammarMemoryRow),
      expressions: sortChildRows((expressionRows ?? []) as ExpressionRow[]).map(
        mapExpressionRow,
      ),
      expressionMemory: ((expressionMemoryRows ?? []) as ExpressionMemoryRow[]).map(
        mapExpressionMemoryRow,
      ),
      exportedAt: new Date().toISOString(),
    };
  },

  async getVocabularyReviewItems() {
    const [items, questions] = await Promise.all([
      getVocabularyItems(),
      this.getAllQuestions(),
    ]);
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return items
      .map((item) => {
        const source = questionMap.get(item.questionId);

        if (!source) {
          return null;
        }

        return {
          ...item,
          source: pickSource(source),
        } satisfies VocabularyReviewItem;
      })
      .filter((item): item is VocabularyReviewItem => item !== null);
  },

  async getGrammarReviewItems() {
    const [items, questions] = await Promise.all([
      getGrammarItems(),
      this.getAllQuestions(),
    ]);
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return items
      .map((item) => {
        const source = questionMap.get(item.questionId);

        if (!source) {
          return null;
        }

        return {
          ...item,
          source: pickSource(source),
        } satisfies GrammarReviewItem;
      })
      .filter((item): item is GrammarReviewItem => item !== null);
  },

  async getExpressionReviewItems() {
    const [items, questions] = await Promise.all([
      getExpressionItems(),
      this.getAllQuestions(),
    ]);
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return items
      .map((item) => {
        const source = questionMap.get(item.questionId);

        if (!source) {
          return null;
        }

        return {
          ...item,
          source: pickSource(source),
        } satisfies ExpressionReviewItem;
      })
      .filter((item): item is ExpressionReviewItem => item !== null);
  },

  async getTodaySmartReviewPlan(dateKey = getLocalDateKey()) {
    await this.ensureSmartAssignments(dateKey);

    const supabase = getSupabaseAdmin();
    const [
      questions,
      vocabularyItems,
      grammarItems,
      expressionItems,
      vocabularyMemoryRows,
      grammarMemoryRows,
      expressionMemoryRows,
    ] = await Promise.all([
      this.getAllQuestions(),
      getVocabularyItems(),
      getGrammarItems(),
      getExpressionItems(),
      unwrap(supabase.from("vocabulary_memory").select("*")),
      unwrap(supabase.from("grammar_memory").select("*")),
      unwrap(supabase.from("expression_memory").select("*")),
    ]);

    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const vocabularyMemoryMap = new Map(
      ((vocabularyMemoryRows ?? []) as VocabularyMemoryRow[]).map((row) => {
        const entry = mapVocabularyMemoryRow(row);
        return [entry.vocabularyId, entry] as const;
      }),
    );
    const grammarMemoryMap = new Map(
      ((grammarMemoryRows ?? []) as GrammarMemoryRow[]).map((row) => {
        const entry = mapGrammarMemoryRow(row);
        return [entry.grammarId, entry] as const;
      }),
    );
    const expressionMemoryMap = new Map(
      ((expressionMemoryRows ?? []) as ExpressionMemoryRow[]).map((row) => {
        const entry = mapExpressionMemoryRow(row);
        return [entry.expressionId, entry] as const;
      }),
    );

    const reviewItems: SmartReviewItem[] = [];
    const refreshCandidates: Array<SmartReviewItem & { score: number }> = [];

    const collectSmartItems = <
      TItem extends VocabularyItem | GrammarItem | ExpressionItem,
      TMemory extends
        | VocabularyMemoryProgress
        | GrammarMemoryProgress
        | ExpressionMemoryProgress,
    >({
      contentType,
      items,
      memoryMap,
    }: {
      contentType: SmartReviewContentType;
      items: TItem[];
      memoryMap: Map<string, TMemory>;
    }) => {
      for (const item of items) {
        const sourceQuestion = questionMap.get(item.questionId);
        const memory = memoryMap.get(item.id);

        if (!sourceQuestion || !memory) {
          continue;
        }

        const daysSinceIntroduced = diffDateKeysInDays(memory.introducedOn, dateKey);

        if (daysSinceIntroduced < 0) {
          continue;
        }

        const enrichedItem = makeSmartItem(contentType, item, pickSource(sourceQuestion), {
          introducedOn: memory.introducedOn,
          lastReviewedOn: memory.lastReviewedOn,
          daysSinceIntroduced,
          cycleDay: Math.min(daysSinceIntroduced + 1, 5),
          phase: "review",
        });

        if (daysSinceIntroduced <= 4) {
          reviewItems.push({
            ...enrichedItem,
            memory: {
              ...enrichedItem.memory,
              phase: daysSinceIntroduced === 0 ? "new" : "review",
            },
          });
          continue;
        }

        if (item.status !== "mastered") {
          reviewItems.push(enrichedItem);
          continue;
        }

        const score = getRefreshScore(`${contentType}:${item.id}`, dateKey);
        const probability = getRefreshProbability(item.reviewCount);

        if (score < probability) {
          refreshCandidates.push({
            ...enrichedItem,
            memory: {
              ...enrichedItem.memory,
              phase: "refresh",
            },
            score,
          });
        }
      }
    };

    collectSmartItems({
      contentType: "vocabulary",
      items: vocabularyItems as VocabularyItem[],
      memoryMap: vocabularyMemoryMap,
    });
    collectSmartItems({
      contentType: "grammar",
      items: grammarItems as GrammarItem[],
      memoryMap: grammarMemoryMap,
    });
    collectSmartItems({
      contentType: "expressions",
      items: expressionItems as ExpressionItem[],
      memoryMap: expressionMemoryMap,
    });

    const refreshItems = refreshCandidates
      .sort((left, right) => left.score - right.score)
      .slice(0, 30)
      .map((candidate) => {
        const { score, ...item } = candidate;
        void score;
        return item;
      });

    const orderedItems = [...reviewItems, ...refreshItems].sort((left, right) => {
      const phaseWeight = getPhaseWeight(left.memory.phase) - getPhaseWeight(right.memory.phase);

      if (phaseWeight !== 0) {
        return phaseWeight;
      }

      if (left.memory.daysSinceIntroduced !== right.memory.daysSinceIntroduced) {
        return right.memory.daysSinceIntroduced - left.memory.daysSinceIntroduced;
      }

      return left.id.localeCompare(right.id);
    });

    return {
      date: dateKey,
      newCount: orderedItems.filter((item) => item.memory.phase === "new").length,
      reviewCount: orderedItems.filter((item) => item.memory.phase === "review").length,
      refreshCount: orderedItems.filter((item) => item.memory.phase === "refresh").length,
      vocabularyCount: orderedItems.filter((item) => item.contentType === "vocabulary").length,
      grammarCount: orderedItems.filter((item) => item.contentType === "grammar").length,
      expressionsCount: orderedItems.filter((item) => item.contentType === "expressions").length,
      items: orderedItems,
    } satisfies SmartReviewPlan;
  },

  async updateSmartReviewStatus(
    contentType: SmartReviewContentType,
    id: string,
    status: StudyStatus,
    dateKey = getLocalDateKey(),
  ) {
    const supabase = getSupabaseAdmin();

    if (contentType === "vocabulary") {
      await updateItemStatus("vocabulary", id, status);
      await unwrap(
        supabase
          .from("vocabulary_memory")
          .update({ last_reviewed_on: dateKey })
          .eq("vocabulary_id", id),
      );
      return;
    }

    if (contentType === "grammar") {
      await updateItemStatus("grammar", id, status);
      await unwrap(
        supabase
          .from("grammar_memory")
          .update({ last_reviewed_on: dateKey })
          .eq("grammar_id", id),
      );
      return;
    }

    await updateItemStatus("expressions", id, status);
    await unwrap(
      supabase
        .from("expression_memory")
        .update({ last_reviewed_on: dateKey })
        .eq("expression_id", id),
    );
  },

  async ensureSmartAssignments(dateKey: string) {
    const supabase = getSupabaseAdmin();
    const [
      vocabularyItems,
      grammarItems,
      expressionItems,
      vocabularyMemoryRows,
      grammarMemoryRows,
      expressionMemoryRows,
    ] = await Promise.all([
      getVocabularyItems(),
      getGrammarItems(),
      getExpressionItems(),
      unwrap(supabase.from("vocabulary_memory").select("*")),
      unwrap(supabase.from("grammar_memory").select("*")),
      unwrap(supabase.from("expression_memory").select("*")),
    ]);

    const vocabularyMemory = ((vocabularyMemoryRows ?? []) as VocabularyMemoryRow[]).map(
      mapVocabularyMemoryRow,
    );
    const grammarMemory = ((grammarMemoryRows ?? []) as GrammarMemoryRow[]).map(
      mapGrammarMemoryRow,
    );
    const expressionMemory = ((expressionMemoryRows ?? []) as ExpressionMemoryRow[]).map(
      mapExpressionMemoryRow,
    );

    const todaysAssignments =
      vocabularyMemory.filter((entry) => entry.introducedOn === dateKey).length +
      grammarMemory.filter((entry) => entry.introducedOn === dateKey).length +
      expressionMemory.filter((entry) => entry.introducedOn === dateKey).length;
    const missingTodayCount = Math.max(0, 50 - todaysAssignments);

    if (missingTodayCount === 0) {
      return;
    }

    const assignedVocabularyIds = new Set(vocabularyMemory.map((entry) => entry.vocabularyId));
    const assignedGrammarIds = new Set(grammarMemory.map((entry) => entry.grammarId));
    const assignedExpressionIds = new Set(expressionMemory.map((entry) => entry.expressionId));

    const candidates = [
      ...vocabularyItems
        .filter((item) => !assignedVocabularyIds.has(item.id))
        .map((item) => ({
          contentType: "vocabulary" as const,
          id: item.id,
          questionId: item.questionId,
        })),
      ...grammarItems
        .filter((item) => !assignedGrammarIds.has(item.id))
        .map((item) => ({
          contentType: "grammar" as const,
          id: item.id,
          questionId: item.questionId,
        })),
      ...expressionItems
        .filter((item) => !assignedExpressionIds.has(item.id))
        .map((item) => ({
          contentType: "expressions" as const,
          id: item.id,
          questionId: item.questionId,
        })),
    ]
      .sort((left, right) => {
        const questionCompare = left.questionId.localeCompare(right.questionId);

        if (questionCompare !== 0) {
          return questionCompare;
        }

        const typeCompare =
          getContentPriority(left.contentType) - getContentPriority(right.contentType);

        if (typeCompare !== 0) {
          return typeCompare;
        }

        return left.id.localeCompare(right.id);
      })
      .slice(0, missingTodayCount);

    const vocabularyAssignments = candidates
      .filter((candidate) => candidate.contentType === "vocabulary")
      .map((candidate) => ({
        vocabulary_id: candidate.id,
        introduced_on: dateKey,
        last_reviewed_on: dateKey,
      }));
    const grammarAssignments = candidates
      .filter((candidate) => candidate.contentType === "grammar")
      .map((candidate) => ({
        grammar_id: candidate.id,
        introduced_on: dateKey,
        last_reviewed_on: dateKey,
      }));
    const expressionAssignments = candidates
      .filter((candidate) => candidate.contentType === "expressions")
      .map((candidate) => ({
        expression_id: candidate.id,
        introduced_on: dateKey,
        last_reviewed_on: dateKey,
      }));

    if (vocabularyAssignments.length > 0) {
      await unwrap(supabase.from("vocabulary_memory").upsert(vocabularyAssignments));
    }

    if (grammarAssignments.length > 0) {
      await unwrap(supabase.from("grammar_memory").upsert(grammarAssignments));
    }

    if (expressionAssignments.length > 0) {
      await unwrap(supabase.from("expression_memory").upsert(expressionAssignments));
    }
  },
};
