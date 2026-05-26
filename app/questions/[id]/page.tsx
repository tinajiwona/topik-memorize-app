"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ItemActions } from "@/components/item-actions";
import { PageShell } from "@/components/page-shell";
import { db } from "@/lib/db/database";
import { formatQuestionMeta, getNextStatus } from "@/lib/topik";
import type { ExpressionItem, GrammarItem, Question, VocabularyItem } from "@/types/topik";

const SECTION_OPTIONS = [
  { key: "vocabulary", label: "中高级词汇" },
  { key: "grammar", label: "语法考点" },
  { key: "expressions", label: "惯用/常用表达" },
] as const;

type QuestionSection = (typeof SECTION_OPTIONS)[number]["key"];

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestedSection = searchParams.get("section");
  const activeSection: QuestionSection =
    requestedSection === "grammar" || requestedSection === "expressions"
      ? requestedSection
      : "vocabulary";

  async function reloadQuestion() {
    setIsLoading(true);
    const nextQuestion = await db.getQuestionById(params.id);
    setQuestion(nextQuestion);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void db.getQuestionById(params.id).then((nextQuestion) => {
      if (!isMounted) {
        return;
      }

      setQuestion(nextQuestion);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  async function handleVocabularyStatus(item: VocabularyItem) {
    await db.updateVocabularyStatus(item.id, getNextStatus(item.status));
    await reloadQuestion();
  }

  async function handleGrammarStatus(item: GrammarItem) {
    await db.updateGrammarStatus(item.id, getNextStatus(item.status));
    await reloadQuestion();
  }

  async function handleExpressionStatus(item: ExpressionItem) {
    await db.updateExpressionStatus(item.id, getNextStatus(item.status));
    await reloadQuestion();
  }

  if (isLoading) {
    return (
      <PageShell
        title="题目详情"
        subtitle="正在读取云端题库内容。"
        actions={
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回题库</span>
          </Link>
        }
      >
        <div className="surface-card p-5 text-sm text-slate-500">正在加载题目...</div>
      </PageShell>
    );
  }

  if (!question) {
    return (
      <PageShell
        title="题目详情"
        subtitle="正在读取云端题库内容。"
        actions={
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回题库</span>
          </Link>
        }
      >
        <EmptyState title="没有找到这道题" description="可能还没导入，或者数据已经被清空。" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={question.title}
      subtitle={formatQuestionMeta(question)}
      actions={
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回题库</span>
        </Link>
      }
    >
      <section className="surface-card grid grid-cols-3 gap-2 p-3">
        {SECTION_OPTIONS.map((section) => {
          const count =
            section.key === "vocabulary"
              ? question.vocabulary.length
              : section.key === "grammar"
                ? question.grammar.length
                : question.expressions.length;

          return (
            <Link
              key={section.key}
              href={`/questions/${encodeURIComponent(question.id)}?section=${section.key}`}
              className={`rounded-2xl px-3 py-4 text-center text-sm font-semibold transition ${
                activeSection === section.key
                  ? "bg-[#1f7a72] text-white shadow-[0_12px_28px_rgba(31,122,114,0.18)]"
                  : "bg-[#f8f4eb] text-slate-600"
              }`}
            >
              {section.key === "vocabulary"
                ? "词汇"
                : section.key === "grammar"
                  ? "语法"
                  : "表达"}{" "}
              {count}
            </Link>
          );
        })}
      </section>

      {activeSection === "vocabulary" ? (
        <section className="surface-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">中高级词汇</h2>
            <span className="text-sm text-slate-500">{question.vocabulary.length} 项</span>
          </div>
          {question.vocabulary.length === 0 ? (
            <p className="text-sm text-slate-500">这一题没有词汇表。</p>
          ) : (
            question.vocabulary.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[#e3ece8] bg-[#fcfaf6] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xl font-semibold tracking-tight text-slate-900">{item.korean}</p>
                    <p className="text-sm leading-6 text-slate-600">{item.chinese}</p>
                  </div>
                  <ItemActions
                    status={item.status}
                    isFavorite={item.isFavorite}
                    onStatusToggle={() => void handleVocabularyStatus(item)}
                    onFavoriteToggle={() =>
                      void db.toggleVocabularyFavorite(item.id, !item.isFavorite).then(reloadQuestion)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </section>
      ) : null}

      {activeSection === "grammar" ? (
        <section className="surface-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">语法考点</h2>
            <span className="text-sm text-slate-500">{question.grammar.length} 项</span>
          </div>
          {question.grammar.length === 0 ? (
            <p className="text-sm text-slate-500">这一题没有语法表。</p>
          ) : (
            question.grammar.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[#e3ece8] bg-[#fcfaf6] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <p className="text-xl font-semibold tracking-tight text-slate-900">{item.grammar}</p>
                    <p className="text-sm leading-6 text-slate-700">{item.expression}</p>
                    <p className="text-sm leading-6 text-slate-500">{item.usage}</p>
                  </div>
                  <ItemActions
                    status={item.status}
                    isFavorite={item.isFavorite}
                    onStatusToggle={() => void handleGrammarStatus(item)}
                    onFavoriteToggle={() =>
                      void db.toggleGrammarFavorite(item.id, !item.isFavorite).then(reloadQuestion)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </section>
      ) : null}

      {activeSection === "expressions" ? (
        <section className="surface-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">惯用/常用表达</h2>
            <span className="text-sm text-slate-500">{question.expressions.length} 项</span>
          </div>
          {question.expressions.length === 0 ? (
            <p className="text-sm text-slate-500">这一题没有惯用表达表。</p>
          ) : (
            question.expressions.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[#e3ece8] bg-[#fcfaf6] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xl font-semibold tracking-tight text-slate-900">
                      {item.koreanExpression}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">{item.chinese}</p>
                  </div>
                  <ItemActions
                    status={item.status}
                    isFavorite={item.isFavorite}
                    onStatusToggle={() => void handleExpressionStatus(item)}
                    onFavoriteToggle={() =>
                      void db.toggleExpressionFavorite(item.id, !item.isFavorite).then(reloadQuestion)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </section>
      ) : null}
    </PageShell>
  );
}
