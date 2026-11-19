"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type ChatMessage,
  type Evaluation,
  type InterviewResponse,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "result";

const QUESTION_OPTIONS = Array.from(
  { length: MAX_QUESTIONS - MIN_QUESTIONS + 1 },
  (_, i) => MIN_QUESTIONS + i,
);

const STAGES: { key: Stage; label: string }[] = [
  { key: "setup", label: "設定職缺" },
  { key: "interview", label: "面試對答" },
  { key: "result", label: "檢討報告" },
];

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium transition hover:border-ink";

export default function InterviewApp() {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === "interview") bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, stage]);

  async function callInterview(history: ChatMessage[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, totalQuestions, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");

      const result = data as InterviewResponse;
      if (result.type === "question") {
        setMessages([...history, { role: "interviewer", content: result.question }]);
        setQuestionNumber(result.questionNumber);
      } else {
        setMessages(history);
        setEvaluation(result.evaluation);
        setStage("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startInterview() {
    if (!jobDescription.trim()) return;
    setMessages([]);
    setEvaluation(null);
    setStage("interview");
    const ok = await callInterview([]);
    if (!ok) setStage("setup");
  }

  async function submitAnswer() {
    const text = answer.trim();
    if (!text || loading) return;
    const history: ChatMessage[] = [...messages, { role: "candidate", content: text }];
    setMessages(history);
    setAnswer("");
    const ok = await callInterview(history);
    if (!ok) {
      // 失敗時還原，讓使用者可以重送
      setMessages(messages);
      setAnswer(text);
    }
  }

  function reset() {
    setStage("setup");
    setMessages([]);
    setAnswer("");
    setQuestionNumber(0);
    setEvaluation(null);
    setError(null);
  }

  const answeredCount = messages.filter((m) => m.role === "candidate").length;
  const stageIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <main className="relative flex-1">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-72 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6">
        {/* 步驟指示 */}
        <ol className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          {STAGES.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition ${
                  i === stageIndex
                    ? "bg-ink text-paper"
                    : i < stageIndex
                      ? "bg-accent-soft text-accent"
                      : "text-muted"
                }`}
              >
                <span className="font-mono">{i < stageIndex ? "✓" : `0${i + 1}`}</span>
                {s.label}
              </span>
              {i < STAGES.length - 1 && <span className="h-px w-4 bg-line sm:w-8" />}
            </li>
          ))}
        </ol>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent"
          >
            {error}
          </div>
        )}

        {/* ── 1. 設定 ─────────────────────────────────── */}
        {stage === "setup" && (
          <section className="animate-rise mt-10">
            <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
              這次要面試<span className="text-accent italic">什麼職位</span>？
            </h1>
            <p className="mt-3 text-muted">
              貼上職缺描述，越完整，面試官出的題目就越貼近真實。
            </p>

            <div className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-[0_20px_60px_-30px_rgba(22,20,15,0.25)] sm:p-7">
              <label htmlFor="jd" className="text-sm font-semibold">
                職缺描述
              </label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={9}
                maxLength={5000}
                placeholder="例如：前端工程師｜熟悉 React / Next.js / TypeScript，具備 3 年以上經驗，負責電商平台效能優化與元件設計…"
                className="mt-3 w-full resize-y rounded-2xl border border-line bg-paper p-4 leading-relaxed outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
              <div className="mt-1 text-right font-mono text-xs text-muted">
                {jobDescription.length} / 5000
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold">題數</div>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="題數">
                  {QUESTION_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={totalQuestions === n}
                      onClick={() => setTotalQuestions(n)}
                      className={`size-10 rounded-xl border font-mono text-sm transition ${
                        totalQuestions === n
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-paper hover:border-ink"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">每題約 1–2 分鐘，{totalQuestions} 題大約需要 {totalQuestions * 2} 分鐘。</p>
              </div>

              <div className="mt-7 flex justify-end border-t border-line pt-5">
                <button
                  onClick={startInterview}
                  disabled={!jobDescription.trim() || loading}
                  className={btnPrimary}
                >
                  {loading ? "準備中…" : "開始面試"}
                  {!loading && <span aria-hidden>→</span>}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── 2. 面試 ─────────────────────────────────── */}
        {stage === "interview" && (
          <section className="mt-10">
            {/* 進度條 */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                第 <span className="font-mono">{Math.max(questionNumber, 1)}</span> 題
                <span className="text-muted"> / 共 {totalQuestions} 題</span>
              </span>
              <button onClick={reset} className="text-muted transition hover:text-accent">
                重新開始
              </button>
            </div>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    i < answeredCount ? "bg-accent" : i === answeredCount ? "bg-ink/40" : "bg-line"
                  }`}
                />
              ))}
            </div>

            {/* 對話 */}
            <div className="mt-8 flex flex-col gap-5">
              {messages.map((m, i) =>
                m.role === "interviewer" ? (
                  <div key={i} className="animate-rise flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm text-paper">
                      面
                    </span>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="animate-rise ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 leading-relaxed whitespace-pre-wrap text-paper"
                  >
                    {m.content}
                  </div>
                ),
              )}

              {loading && (
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm text-paper">
                    面
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 text-sm text-muted">
                    <span className="flex gap-1">
                      <span className="typing-dot size-1.5 rounded-full bg-current" />
                      <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:0.2s]" />
                      <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:0.4s]" />
                    </span>
                    {answeredCount >= totalQuestions ? "正在評分並整理每題建議…" : "面試官思考中…"}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* 回答輸入框 */}
            <div className="sticky bottom-4 mt-8 rounded-3xl border border-line bg-surface/95 p-3 shadow-[0_20px_50px_-20px_rgba(22,20,15,0.35)] backdrop-blur">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAnswer();
                }}
                rows={3}
                maxLength={3000}
                disabled={loading}
                placeholder="輸入你的回答…"
                aria-label="你的回答"
                className="w-full resize-none bg-transparent px-2 py-1 leading-relaxed outline-none placeholder:text-muted/70 disabled:opacity-50"
              />
              <div className="flex items-center justify-between gap-3 pl-2">
                <span className="hidden text-xs text-muted sm:inline">
                  <kbd className="rounded border border-line px-1.5 py-0.5 font-mono">Ctrl</kbd> +{" "}
                  <kbd className="rounded border border-line px-1.5 py-0.5 font-mono">Enter</kbd> 送出
                </span>
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || loading}
                  className={`${btnPrimary} ml-auto px-5 py-2.5`}
                >
                  送出回答 <span aria-hidden>↑</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── 3. 結果 ─────────────────────────────────── */}
        {stage === "result" && evaluation && (
          <section className="animate-rise mt-10 flex flex-col gap-6">
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">你的檢討報告</h1>

            {/* 分數 + 總評 */}
            <div className="grid gap-6 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
              <ScoreRing score={evaluation.score} />
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                  總評
                </div>
                <p className="mt-2 text-lg leading-relaxed">{evaluation.summary}</p>
              </div>
            </div>

            {/* 優點 / 改進 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ListCard title="優點" tone="good" items={evaluation.strengths} />
              <ListCard title="改進建議" tone="accent" items={evaluation.improvements} />
            </div>

            {/* 逐題檢討 */}
            <div className="mt-4">
              <h2 className="font-display text-3xl font-semibold">逐題檢討</h2>
              <div className="mt-5 flex flex-col gap-3">
                {evaluation.questions.map((q, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group rounded-3xl border border-line bg-surface p-5 transition open:border-ink/30 sm:p-6"
                  >
                    <summary className="flex cursor-pointer items-start gap-4">
                      <span className="font-display text-3xl leading-none text-accent italic">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 pt-1 font-medium leading-relaxed">{q.question}</span>
                      <span className="chevron grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform">
                        +
                      </span>
                    </summary>

                    <div className="mt-5 space-y-3 text-sm leading-relaxed sm:pl-12">
                      <div className="rounded-2xl bg-surface-2 p-4">
                        <div className="mb-1 text-xs font-semibold text-muted">你的回答</div>
                        <p className="whitespace-pre-wrap">{q.answer}</p>
                      </div>
                      {q.feedback && (
                        <div className="rounded-2xl bg-accent-soft p-4">
                          <div className="mb-1 text-xs font-semibold text-accent">點評</div>
                          <p className="whitespace-pre-wrap">{q.feedback}</p>
                        </div>
                      )}
                      {q.betterAnswer && (
                        <div className="rounded-2xl bg-good-soft p-4">
                          <div className="mb-1 text-xs font-semibold text-good">較佳的回答方式</div>
                          <p className="whitespace-pre-wrap">{q.betterAnswer}</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={reset} className={btnPrimary}>
                再練習一次 <span aria-hidden>↻</span>
              </button>
              <button
                onClick={() => {
                  setStage("setup");
                  setError(null);
                }}
                className={btnGhost}
              >
                修改職缺描述
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/** 環形分數 */
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl leading-none">{score}</div>
          <div className="mt-1 font-mono text-xs text-muted">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function ListCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "good" | "accent";
  items: string[];
}) {
  const dot = tone === "good" ? "bg-good" : "bg-accent";
  const text = tone === "good" ? "text-good" : "text-accent";
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <h2 className={`text-xs font-semibold tracking-[0.18em] uppercase ${text}`}>{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((s, i) => (
          <li key={i} className="flex gap-3 leading-relaxed">
            <span className={`mt-2.5 size-1.5 shrink-0 rounded-full ${dot}`} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
