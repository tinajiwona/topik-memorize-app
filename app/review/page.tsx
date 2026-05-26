import Link from "next/link";
import { BrainCircuit, LibraryBig, Sparkles } from "lucide-react";

import { PageShell } from "@/components/page-shell";

const REVIEW_LINKS = [
  {
    href: "/review/library",
    title: "按题库背诵",
    description: "按词汇、语法、惯用表达直接刷整套题库。",
    icon: LibraryBig,
  },
  {
    href: "/review/smart",
    title: "按记忆规则背诵",
    description: "每天 50 新词，叠加近 5 天循环复习，熟词低频抽查。",
    icon: Sparkles,
  },
];

export default function ReviewHubPage() {
  return (
    <PageShell
      title="背诵入口"
      subtitle="现在分成两套入口：一套按题库直接刷，一套按记忆规则自动生成每日词汇计划。"
    >
      <section className="surface-card overflow-hidden p-5">
        <div className="rounded-[24px] bg-[#1f7a72] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-white/75">MEMORY FLOW</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">先导入，再选背诵模式</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/80">
            按题库背诵适合自由刷卡，按记忆规则背诵适合每日固定推进 50 个新词和 5 天回顾。
          </p>
        </div>
      </section>

      {REVIEW_LINKS.map(({ href, title, description, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="surface-card flex items-center gap-4 p-5 transition active:scale-[0.98]"
        >
          <div className="rounded-[22px] bg-[#e0f0ec] p-3 text-[#1f7a72]">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </Link>
      ))}
    </PageShell>
  );
}
