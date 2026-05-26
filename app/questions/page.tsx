"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { db } from "@/lib/db/database";
import { LEVEL_OPTIONS, PART_LABELS, PART_OPTIONS } from "@/lib/topik";
import type { Question, TopikLevel, TopikPart } from "@/types/topik";

const SECTION_LINKS = [
  { key: "vocabulary", label: "词汇" },
  { key: "grammar", label: "语法" },
  { key: "expressions", label: "表达" },
] as const;

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [exam, setExam] = useState<string>("all");
  const [level, setLevel] = useState<TopikLevel | "all">("all");
  const [part, setPart] = useState<TopikPart | "all">("all");

  useEffect(() => {
    void db.getAllQuestions().then((loaded) => {
      setAllQuestions(loaded);
      setQuestions(loaded);
    });
  }, []);

  useEffect(() => {
    void db
      .getAllQuestions({
        exam: exam === "all" ? undefined : Number(exam),
        level: level === "all" ? undefined : level,
        part: part === "all" ? undefined : part,
      })
      .then(setQuestions);
  }, [exam, level, part]);

  const exams = Array.from(new Set(allQuestions.map((question) => question.exam))).sort(
    (left, right) => right - left,
  );

  return (
    <PageShell title="按题复习" subtitle="按届数、等级和题型筛选，逐题进入查看词汇、语法和惯用表达。">
      <section className="surface-card grid grid-cols-1 gap-3 p-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">届数</span>
          <select
            value={exam}
            onChange={(event) => setExam(event.target.value)}
            className="w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 outline-none"
          >
            <option value="all">全部</option>
            {exams.map((option) => (
              <option key={option} value={option}>
                第 {option} 届
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">等级</span>
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as TopikLevel | "all")}
            className="w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 outline-none"
          >
            <option value="all">全部</option>
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">题型</span>
          <select
            value={part}
            onChange={(event) => setPart(event.target.value as TopikPart | "all")}
            className="w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 outline-none"
          >
            <option value="all">全部</option>
            {PART_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PART_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3">
        {questions.length === 0 ? (
          <EmptyState
            title="还没有题目"
            description="先导入 Markdown 资料，或者调整筛选条件。"
            action={
              <Link
                href="/import"
                className="inline-flex rounded-2xl bg-[#1f7a72] px-5 py-3 text-sm font-semibold text-white"
              >
                去导入
              </Link>
            }
          />
        ) : (
          questions.map((question) => (
            <div key={question.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/questions/${encodeURIComponent(question.id)}?section=vocabulary`}
                    className="block"
                  >
                    <h2 className="text-lg font-semibold text-slate-900">{question.title}</h2>
                  </Link>
                  <p className="mt-2 text-sm text-slate-500">第 {question.exam} 届</p>
                </div>
                <span className="rounded-full bg-[#eef4f1] px-3 py-1 text-xs font-semibold text-[#1f7a72]">
                  {PART_LABELS[question.part]}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600">
                {SECTION_LINKS.map((section) => {
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
                      className="rounded-2xl bg-[#f8f4eb] px-3 py-4 text-center font-medium transition active:scale-[0.98]"
                    >
                      {section.label} {count}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </PageShell>
  );
}
