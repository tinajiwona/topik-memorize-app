"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  BrainCircuit,
  Cloud,
  Import,
  LibraryBig,
  Languages,
} from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { db } from "@/lib/db/database";
import type { StudyStats } from "@/types/topik";

const ACTIONS = [
  { href: "/import", label: "导入资料", icon: Import },
  { href: "/questions", label: "按题复习", icon: LibraryBig },
  { href: "/review/vocabulary", label: "背单词", icon: Languages },
  { href: "/review/grammar", label: "背语法", icon: BookOpenText },
  { href: "/review/expressions", label: "背惯用表达", icon: BrainCircuit },
  { href: "/sync", label: "同步状态", icon: Cloud },
];

const EMPTY_STATS: StudyStats = {
  questions: 0,
  vocabulary: 0,
  grammar: 0,
  expressions: 0,
};

export default function Home() {
  const [stats, setStats] = useState<StudyStats>(EMPTY_STATS);

  useEffect(() => {
    void db.getStats().then(setStats);
  }, []);

  return (
    <PageShell
      title="TOPIK 真题背诵库"
      subtitle="把飞书整理内容粘进来，直接在手机里按题、按词汇、按语法和按表达反复背。"
    >
      <section className="surface-card overflow-hidden p-5">
        <div className="rounded-[24px] bg-[#1f7a72] p-5 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Supabase Sync</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">今天的背诵入口</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            题库和背诵进度保存在 Supabase，同一个网址下的手机和电脑可以共用同一份数据。
          </p>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">手机安装方法</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-[#f8fafc] p-4">
            <p className="text-sm font-semibold text-slate-900">iPhone</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Safari 打开本页面 → 分享 → 添加到主屏幕。
            </p>
          </div>
          <div className="rounded-2xl bg-[#f8fafc] p-4">
            <p className="text-sm font-semibold text-slate-900">Android</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chrome 打开本页面 → 菜单 → 安装应用。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">总题数</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.questions}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">单词数</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.vocabulary}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">语法数</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.grammar}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">惯用表达数</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.expressions}</p>
        </div>
      </section>

      <section className="space-y-3">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface-card flex min-h-[5.5rem] items-center justify-between p-5 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#e0f0ec] p-3 text-[#1f7a72]">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold text-slate-900">{label}</span>
            </div>
            <span className="text-sm text-slate-400">进入</span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
