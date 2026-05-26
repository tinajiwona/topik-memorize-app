"use client";

import { ReviewSession } from "@/components/review-session";
import { db } from "@/lib/db/database";

export default function GrammarReviewPage() {
  return (
    <ReviewSession
      title="背语法"
      subtitle="正面先看语法点，翻面看表达、用法和来源。"
      reviewLabel="语法卡"
      backHref="/review/library"
      backLabel="返回题库背诵"
      loadItems={() => db.getGrammarReviewItems()}
      getFront={(item) => item.grammar}
      getBackLines={(item) => [`表达：${item.expression}`, `用法：${item.usage}`]}
      onReview={(id, status) => db.updateGrammarStatus(id, status)}
      onFavoriteToggle={(id, isFavorite) => db.toggleGrammarFavorite(id, isFavorite)}
    />
  );
}
