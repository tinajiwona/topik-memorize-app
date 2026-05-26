"use client";

import type {
  ExportedTopikData,
  ExpressionReviewItem,
  GrammarReviewItem,
  Question,
  QuestionFilters,
  SmartReviewContentType,
  SmartReviewPlan,
  StudyStats,
  StudyStatus,
  TopikPart,
  VocabularyReviewItem,
} from "@/types/topik";

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | {
        error?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : "Request failed.",
    );
  }

  return payload as T;
}

class TopikDatabaseClient {
  async importQuestions(questions: Question[]) {
    await requestJson<{ success: boolean }>("/api/topik/import", {
      method: "POST",
      body: JSON.stringify({ questions }),
    });
  }

  getAllQuestions(filters: QuestionFilters = {}) {
    const searchParams = new URLSearchParams();

    if (filters.exam !== undefined) {
      searchParams.set("exam", String(filters.exam));
    }

    if (filters.level !== undefined) {
      searchParams.set("level", filters.level);
    }

    if (filters.part !== undefined) {
      searchParams.set("part", filters.part);
    }

    const suffix = searchParams.toString();
    return requestJson<Question[]>(
      suffix ? `/api/topik/questions?${suffix}` : "/api/topik/questions",
    );
  }

  getQuestionById(id: string) {
    return requestJson<Question | null>(`/api/topik/questions/${encodeURIComponent(id)}`);
  }

  getStats() {
    return requestJson<StudyStats>("/api/topik/stats");
  }

  async updateVocabularyStatus(id: string, status: StudyStatus) {
    await requestJson<{ success: boolean }>(
      `/api/topik/items/vocabulary/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  }

  async updateGrammarStatus(id: string, status: StudyStatus) {
    await requestJson<{ success: boolean }>(`/api/topik/items/grammar/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async updateExpressionStatus(id: string, status: StudyStatus) {
    await requestJson<{ success: boolean }>(
      `/api/topik/items/expressions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  }

  async toggleVocabularyFavorite(id: string, isFavorite: boolean) {
    await requestJson<{ success: boolean }>(
      `/api/topik/items/vocabulary/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ isFavorite }),
      },
    );
  }

  async toggleGrammarFavorite(id: string, isFavorite: boolean) {
    await requestJson<{ success: boolean }>(`/api/topik/items/grammar/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ isFavorite }),
    });
  }

  async toggleExpressionFavorite(id: string, isFavorite: boolean) {
    await requestJson<{ success: boolean }>(
      `/api/topik/items/expressions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ isFavorite }),
      },
    );
  }

  async clearExamData(exam: number) {
    await requestJson<{ success: boolean }>(`/api/topik/exams/${exam}`, {
      method: "DELETE",
    });
  }

  exportAllData() {
    return requestJson<ExportedTopikData>("/api/topik/export");
  }

  getVocabularyReviewItems() {
    return requestJson<VocabularyReviewItem[]>("/api/topik/review/vocabulary");
  }

  getGrammarReviewItems() {
    return requestJson<GrammarReviewItem[]>("/api/topik/review/grammar");
  }

  getExpressionReviewItems() {
    return requestJson<ExpressionReviewItem[]>("/api/topik/review/expressions");
  }

  getTodaySmartReviewPlan(dateKey?: string) {
    const suffix = dateKey ? `?dateKey=${encodeURIComponent(dateKey)}` : "";
    return requestJson<SmartReviewPlan>(`/api/topik/review/smart${suffix}`);
  }

  async updateSmartReviewStatus(
    contentType: SmartReviewContentType,
    id: string,
    status: StudyStatus,
    dateKey?: string,
  ) {
    await requestJson<{ success: boolean }>("/api/topik/review/smart", {
      method: "POST",
      body: JSON.stringify({
        contentType,
        id,
        status,
        dateKey,
      }),
    });
  }
}

export const db = new TopikDatabaseClient();

export function getReviewPath(part: TopikPart) {
  if (part === "reading") {
    return "/review/vocabulary";
  }

  if (part === "listening") {
    return "/review/expressions";
  }

  return "/review/grammar";
}
