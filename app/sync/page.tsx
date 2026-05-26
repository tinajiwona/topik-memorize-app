"use client";

import { useEffect, useState } from "react";
import { Cloud, RefreshCcw } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { db } from "@/lib/db/database";
import type { StudyStats } from "@/types/topik";

const EMPTY_STATS: StudyStats = {
  questions: 0,
  vocabulary: 0,
  grammar: 0,
  expressions: 0,
};

export default function SyncPage() {
  const [stats, setStats] = useState<StudyStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("正在检查 Supabase 同步状态...");
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");

    try {
      const nextStats = await db.getStats();
      setStats(nextStats);
      setMessage("Supabase 同步正常。当前页面展示的是云端最新统计。");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "同步检查失败。");
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <PageShell
      title="同步状态"
      subtitle="这个页面用来确认手机和电脑访问的是同一份 Supabase 数据。"
    >
      <section className="surface-card overflow-hidden p-5">
        <div className="rounded-[24px] bg-[#2563eb] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-white/75">SYNC CHECK</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Supabase 云同步</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/85">
            在电脑导入 Markdown、在手机修改状态后，只要这里的统计一致，就说明两端正在共用同一份数据。
          </p>
        </div>
      </section>

      <section className="surface-card grid grid-cols-2 gap-3 p-4">
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-sm text-slate-500">总题数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.questions}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-sm text-slate-500">单词数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.vocabulary}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-sm text-slate-500">语法数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.grammar}</p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] p-4">
          <p className="text-sm text-slate-500">惯用表达数</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.expressions}</p>
        </div>
      </section>

      <section className="surface-card p-5">
        {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}
        {error ? <p className="text-sm leading-6 text-rose-600">{error}</p> : null}
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="mt-4 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>{isLoading ? "检查中..." : "刷新同步状态"}</span>
        </button>
      </section>
    </PageShell>
  );
}
