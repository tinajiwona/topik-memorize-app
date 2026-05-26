import Link from "next/link";
import { ArrowLeft, BookOpenText, BrainCircuit, Languages } from "lucide-react";

import { PageShell } from "@/components/page-shell";

const REVIEW_LINKS = [
  {
    href: "/review/vocabulary",
    title: "背单词",
    description: "按题库顺序直接刷全部词汇卡。",
    icon: Languages,
  },
  {
    href: "/review/grammar",
    title: "背语法",
    description: "看语法点，翻面看表达和用法。",
    icon: BookOpenText,
  },
  {
    href: "/review/expressions",
    title: "背惯用表达",
    description: "韩语表达正面，中文背面，配来源题号。",
    icon: BrainCircuit,
  },
];

export default function ReviewLibraryPage() {
  return (
    <PageShell
      title="按题库背诵"
      subtitle="按词汇、语法、惯用表达三个维度，直接刷整套题库。"
      actions={
        <Link
          href="/review"
          className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_30px_rgba(21,50,50,0.08)] ring-1 ring-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回背诵入口</span>
        </Link>
      }
    >
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
