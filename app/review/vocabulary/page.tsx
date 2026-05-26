"use client";

import { ReviewSession } from "@/components/review-session";
import { db } from "@/lib/db/database";

export default function VocabularyReviewPage() {
  return (
    <ReviewSession
      title="背单词"
      subtitle="点击卡片翻面，看中文释义，再用按钮记录熟悉程度。"
      reviewLabel="词汇卡"
      backHref="/review/library"
      backLabel="返回题库背诵"
      loadItems={() => db.getVocabularyReviewItems()}
      getFront={(item) => item.korean}
      getBackLines={(item) => [item.chinese]}
      onReview={(id, status) => db.updateVocabularyStatus(id, status)}
      onFavoriteToggle={(id, isFavorite) => db.toggleVocabularyFavorite(id, isFavorite)}
    />
  );
}
