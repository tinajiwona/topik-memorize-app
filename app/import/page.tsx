"use client";

import type { ChangeEvent } from "react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { Question, TopikLevel, TopikPart } from "@/types/topik";

const TEST_MARKDOWN = `# 阅读 31번

## 中高级词汇

| 韩语 | 中文 |
|---|---|
| 얼어붙다 | 冻住；变得寒冷 |
| 북적대다 | 拥挤，熙熙攘攘 |

## 语法考点

| 语法 | 表达 | 用法 |
|---|---|---|
| V-(으)ㄴ N | 얼어붙은 봄 | 过去或完成状态修饰名词。 |
| N에 비해 | 전년에 비해 | 表示比较，“与……相比”。 |

## 惯用/常用表达

| 韩语表达 | 中文 |
|---|---|
| 병원에 북적대다 | 医院人很多 |`;

interface ParseSummary {
  questions: number;
  vocabulary: number;
  grammar: number;
  expressions: number;
}

const EMPTY_SUMMARY: ParseSummary = {
  questions: 0,
  vocabulary: 0,
  grammar: 0,
  expressions: 0,
};

const LEVEL_OPTIONS: TopikLevel[] = ["intermediate", "advanced"];
const PART_OPTIONS: TopikPart[] = ["reading", "listening", "grammar_writing"];
const PART_LABELS: Record<TopikPart, string> = {
  listening: "听力",
  reading: "阅读",
  grammar_writing: "语法/写作",
};

async function getDatabase() {
  const databaseModule = await import("@/lib/db/database");
  return databaseModule.db;
}

async function getParserModule() {
  return import("@/lib/parser/parseTopikMarkdown");
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };

    reader.onerror = () => {
      reject(new Error("file_read_failed"));
    };

    reader.readAsText(file, "utf-8");
  });
}

export default function ImportPage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [exam, setExam] = useState("34");
  const [level, setLevel] = useState<TopikLevel>("advanced");
  const [part, setPart] = useState<TopikPart>("reading");
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState<Question[]>([]);
  const [summary, setSummary] = useState<ParseSummary>(EMPTY_SUMMARY);
  const [recognizedTitles, setRecognizedTitles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const debugPreview = useMemo(() => markdown.slice(0, 500), [markdown]);
  const isHydrated = typeof window !== "undefined";

  function getCurrentMarkdown() {
    return textareaRef.current?.value ?? markdown;
  }

  function resetPreview() {
    setPreview([]);
    setSummary(EMPTY_SUMMARY);
    setRecognizedTitles([]);
  }

  function applyMarkdown(nextMarkdown: string) {
    setMarkdown(nextMarkdown);

    if (textareaRef.current && textareaRef.current.value !== nextMarkdown) {
      textareaRef.current.value = nextMarkdown;
    }
  }

  async function runPreview(rawMarkdown: string) {
    const currentMarkdown = rawMarkdown.replace(/^\uFEFF/, "");
    const trimmed = currentMarkdown.trim();
    const examNumber = Number(exam);

    applyMarkdown(currentMarkdown);
    setMessage("");
    setError("");

    if (trimmed.length === 0) {
      resetPreview();
      setError("当前 Markdown 字符数为 0，请确认是否粘贴成功。");
      return;
    }

    if (!Number.isFinite(examNumber) || examNumber <= 0) {
      resetPreview();
      setError("请输入有效届数。");
      return;
    }

    const context = {
      exam: examNumber,
      level,
      part,
    };
    const parserModule = await getParserModule();
    const questions = parserModule.parseTopikMarkdown(currentMarkdown, context);
    const inspection = parserModule.inspectTopikMarkdown(currentMarkdown, context);

    setPreview(questions);
    setRecognizedTitles(inspection.recognizedQuestionHeadings);
    setSummary({
      questions: inspection.questionCount,
      vocabulary: inspection.vocabularyCount,
      grammar: inspection.grammarCount,
      expressions: inspection.expressionsCount,
    });

    if (inspection.recognizedQuestionHeadings.length === 0) {
      setError("没有识别到题号标题，请检查是否包含 # 阅读 31번 这样的标题。");
      return;
    }

    if (
      inspection.questionCount > 0 &&
      inspection.vocabularyCount === 0 &&
      inspection.grammarCount === 0 &&
      inspection.expressionsCount === 0
    ) {
      setError("识别到题号，但没有识别到表格，请检查表格列名。");
      return;
    }

    setMessage(`解析成功，共识别 ${questions.length} 道题。`);
  }

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setMarkdown(event.target.value);
  }

  function handlePreview() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const liveMarkdown = getCurrentMarkdown();
    void runPreview(liveMarkdown);
  }

  function handleInsertTestMarkdown() {
    setSelectedFileName("测试 Markdown");
    void runPreview(TEST_MARKDOWN);
  }

  async function handleImport() {
    if (preview.length === 0) {
      setError("请先解析预览。");
      setMessage("");
      return;
    }

    setIsImporting(true);
    setError("");

    try {
      const database = await getDatabase();
      await database.importQuestions(preview);
      setMessage(`导入成功，共写入 ${preview.length} 道题。`);
    } catch {
      setError("写入 Supabase 失败，请确认环境变量、网络和数据表结构已配置完成。");
      setMessage("");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsReadingFile(true);
    setSelectedFileName(file.name);
    setMessage("");
    setError("");

    try {
      const text = await readFileAsText(file);
      await runPreview(text);
    } catch {
      resetPreview();
      setError("文件读取失败，请重新选择 .md 文件。");
    } finally {
      setIsReadingFile(false);
      event.target.value = "";
    }
  }

  async function handleExport() {
    try {
      const database = await getDatabase();
      const payload = await database.exportAllData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `topik-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("已导出全部数据为 JSON。");
      setError("");
    } catch {
      setError("导出失败，请确认 Supabase 可用。");
      setMessage("");
    }
  }

  async function handleClearExam() {
    const examNumber = Number(exam);

    if (!Number.isFinite(examNumber) || examNumber <= 0) {
      setError("请输入要清空的届数。");
      setMessage("");
      return;
    }

    try {
      const database = await getDatabase();
      await database.clearExamData(examNumber);
      resetPreview();
      setMessage(`已清空第 ${examNumber} 届数据。`);
      setError("");
    } catch {
      setError("清空失败，请确认 Supabase 可用。");
      setMessage("");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#f7f3ea] px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] text-slate-900">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#1f7a72]">TOPIK IMPORT</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">导入资料</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            手机网页版简化模式：粘贴 Markdown 或选择 `.md` 文件，直接解析，再确认导入。
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-[#d9e4df]"
        >
          返回
        </Link>
      </header>

      <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-[#e8eeea]">
        客户端状态：
        <span suppressHydrationWarning>{isHydrated ? "已挂载" : "未挂载"}</span>
      </div>

      <section className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">届数 exam</span>
              <input
                value={exam}
                onChange={(event) => setExam(event.target.value)}
                inputMode="numeric"
                className="block w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 text-base"
                placeholder="例如 34"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">等级 level</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as TopikLevel)}
                className="block w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 text-base"
              >
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">题型 part</span>
              <select
                value={part}
                onChange={(event) => setPart(event.target.value as TopikPart)}
                className="block w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-3 text-base"
              >
                {PART_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / {PART_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
          <p className="mb-2 text-sm font-medium text-slate-700">本地 Markdown 文件</p>
          <input
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain,*/*"
            onChange={handleFileChange}
            className="block w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-3 py-3 text-sm text-slate-700"
          />
          {selectedFileName ? (
            <p className="mt-2 text-xs text-slate-500">当前文件：{selectedFileName}</p>
          ) : null}
          {isReadingFile ? (
            <p className="mt-2 text-xs text-[#1f7a72]">正在读取文件...</p>
          ) : null}
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Markdown</p>
            <p className="text-xs text-slate-500">当前 textarea 字符数：{markdown.length}</p>
          </div>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={handleTextareaChange}
            onInput={(event) => {
              setMarkdown(event.currentTarget.value);
            }}
            onPaste={() => {
              window.setTimeout(() => {
                setMarkdown(getCurrentMarkdown());
              }, 0);
            }}
            className="block min-h-[320px] w-full rounded-2xl border border-[#d6e3de] bg-[#fcfaf6] px-4 py-4 text-base leading-7"
            placeholder="把飞书整理后的 Markdown 粘贴到这里"
            spellCheck={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="min-h-[3.5rem] w-full rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white"
          >
            解析预览
          </button>
          <button
            type="button"
            onClick={handleInsertTestMarkdown}
            className="min-h-[3.5rem] w-full rounded-2xl bg-[#eef4f1] px-4 py-4 text-base font-semibold text-[#1f7a72]"
          >
            插入测试 Markdown
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={isImporting}
            className="min-h-[3.5rem] w-full rounded-2xl bg-[#1f7a72] px-4 py-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {isImporting ? "导入中..." : "确认导入"}
          </button>
        </div>
      </section>

      {message ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">解析结果</h2>
          <span className="text-sm text-slate-500">{summary.questions} 道题</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p className="text-sm text-slate-500">题目数量</p>
            <p className="mt-2 text-2xl font-semibold">{summary.questions}</p>
          </div>
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p className="text-sm text-slate-500">词汇数量</p>
            <p className="mt-2 text-2xl font-semibold">{summary.vocabulary}</p>
          </div>
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p className="text-sm text-slate-500">语法数量</p>
            <p className="mt-2 text-2xl font-semibold">{summary.grammar}</p>
          </div>
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p className="text-sm text-slate-500">表达数量</p>
            <p className="mt-2 text-2xl font-semibold">{summary.expressions}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#fcfaf6] p-4">
          <p className="text-sm text-slate-500">识别到的题号标题</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {recognizedTitles.length > 0 ? recognizedTitles.join("\n") : "还没有识别到题号标题"}
          </pre>
        </div>

        {preview.length > 0 ? (
          <div className="mt-4 space-y-3">
            {preview.map((question) => (
              <article key={question.id} className="rounded-2xl border border-[#e1ebe6] p-4">
                <p className="text-base font-semibold">{question.title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  词汇 {question.vocabulary.length} · 语法 {question.grammar.length} · 表达{" "}
                  {question.expressions.length}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
        <h2 className="text-lg font-semibold">Debug</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p>当前 textarea 字符数：{markdown.length}</p>
            <p>解析出的题目数量：{summary.questions}</p>
            <p>词汇数量：{summary.vocabulary}</p>
            <p>语法数量：{summary.grammar}</p>
            <p>惯用表达数量：{summary.expressions}</p>
          </div>
          <div className="rounded-2xl bg-[#fcfaf6] p-4">
            <p className="mb-2 font-semibold text-slate-700">前 500 个字符</p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6">
              {debugPreview || "当前没有 Markdown 内容"}
            </pre>
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e8eeea]">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="w-full rounded-2xl bg-[#eef4f1] px-4 py-4 text-base font-semibold text-[#1f7a72]"
        >
          导出全部数据为 JSON
        </button>
        <button
          type="button"
          onClick={() => void handleClearExam()}
          className="w-full rounded-2xl bg-rose-50 px-4 py-4 text-base font-semibold text-rose-700"
        >
          清空当前输入届数的数据
        </button>
      </section>
    </main>
  );
}
