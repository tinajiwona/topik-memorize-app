import { fail, ok } from "@/lib/server/api-response";
import { topikStore } from "@/lib/server/topik-store";
import type { StudyStatus } from "@/types/topik";

export const dynamic = "force-dynamic";

type ItemKind = "vocabulary" | "grammar" | "expressions";

function isKind(value: string): value is ItemKind {
  return value === "vocabulary" || value === "grammar" || value === "expressions";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const { kind, id } = await context.params;

    if (!isKind(kind)) {
      return fail(new Error("Unsupported item kind."), 400);
    }

    const payload = (await request.json()) as {
      status?: StudyStatus;
      isFavorite?: boolean;
    };

    if (payload.status) {
      if (kind === "vocabulary") {
        await topikStore.updateVocabularyStatus(id, payload.status);
      } else if (kind === "grammar") {
        await topikStore.updateGrammarStatus(id, payload.status);
      } else {
        await topikStore.updateExpressionStatus(id, payload.status);
      }
    }

    if (typeof payload.isFavorite === "boolean") {
      if (kind === "vocabulary") {
        await topikStore.toggleVocabularyFavorite(id, payload.isFavorite);
      } else if (kind === "grammar") {
        await topikStore.toggleGrammarFavorite(id, payload.isFavorite);
      } else {
        await topikStore.toggleExpressionFavorite(id, payload.isFavorite);
      }
    }

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
