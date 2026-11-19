import Link from "next/link";

const STATS = [
  { value: "1–10", label: "題數自由設定" },
  { value: "100", label: "分制量化評分" },
  { value: "逐題", label: "示範回答與點評" },
  { value: "0", label: "筆對話存在伺服器" },
];

const FEATURES = [
  {
    title: "依職缺量身出題",
    body: "貼上任何一份職缺描述，面試官會從職責與技能要求中挑出最可能被問的題目，而不是千篇一律的題庫。",
    icon: "M4 6h16M4 12h10M4 18h7",
    wide: true,
  },
  {
    title: "像真人一樣追問",
    body: "回答太籠統？面試官會針對你的內容繼續深挖，逼你把細節講清楚。",
    icon: "M5 12h14M13 6l6 6-6 6",
  },
  {
    title: "量化評分",
    body: "結束後拿到 0–100 的分數與整體評語，練習進步一目了然。",
    icon: "M5 19V11M12 19V5M19 19v-6",
  },
  {
    title: "每題都有更好的答法",
    body: "不只告訴你哪裡不好，還會沿用你自己的經驗，示範一個結構清楚、貼合職缺的回答版本。",
    icon: "M5 13l4 4L19 7",
    wide: true,
  },
];

const STEPS = [
  { n: "01", title: "貼上職缺描述", body: "從求職網站複製 JD，並選擇這次想練幾題。" },
  { n: "02", title: "和面試官對答", body: "一題一題回答，面試官會依你的回答追問或換題。" },
  { n: "03", title: "拿到檢討報告", body: "分數、優點、改進建議，以及每一題的示範回答。" },
];

const FAQS = [
  {
    q: "需要註冊或付費嗎？",
    a: "不需要。打開練習頁面、貼上職缺描述就能直接開始。",
  },
  {
    q: "我的回答會被保存嗎？",
    a: "伺服器不會保存你的面試紀錄。對話只存在你的瀏覽器分頁中，並在出題與評分時傳送給 OpenAI 模型處理；關閉或重新整理頁面後就會消失。",
  },
  {
    q: "可以用英文面試嗎？",
    a: "目前面試官預設以繁體中文提問與評分。你仍然可以貼上英文職缺描述，題目會依內容出題。",
  },
  {
    q: "評分準確嗎？",
    a: "評分由 AI 根據職缺需求與回答品質產生，適合作為練習時的參考方向，不代表任何公司的實際錄取標準。",
  },
];

function ArrowLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:brightness-110 shadow-[0_8px_24px_-8px_var(--accent)]"
      : "border border-line bg-surface hover:border-ink";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${styles}`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/** Hero 右側的產品預覽卡片（純展示） */
function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent-soft blur-2xl" />
      <div className="rotate-[0.6deg] rounded-3xl border border-line bg-surface p-5 shadow-[0_30px_80px_-30px_rgba(22,20,15,0.35)]">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-muted">面試進行中 · 前端工程師</span>
          </div>
          <span className="font-mono text-xs text-muted">2 / 3</span>
        </div>

        <div className="space-y-3 py-5 text-sm leading-relaxed">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3">
            你提到把 LCP 從 4 秒降到 1.8 秒，能具體說說你用了哪些手段嗎？
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-paper">
            主要是圖片懶載入、拆分 bundle，還有把首頁改成 SSR…
          </div>
          <div className="flex items-center gap-1.5 px-1 text-muted">
            <span className="typing-dot size-1.5 rounded-full bg-current" />
            <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:0.2s]" />
            <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:0.4s]" />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4">
          <div className="font-display text-5xl leading-none text-accent">82</div>
          <div className="text-xs leading-relaxed text-muted">
            <div className="font-semibold text-ink">回答具體、有數據支撐</div>
            建議補充團隊協作與取捨的思考過程
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 md:pt-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              AI 驅動的面試演練
            </span>
            <h1 className="mt-6 font-display text-[2.2rem] leading-[1.15] font-semibold tracking-tight sm:text-6xl">
              每一場面試，
              <br />
              都值得先<span className="text-accent italic">彩排</span>一次。
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              貼上職缺描述，AI 面試官會為你量身出題、針對回答追問，最後給出評分，並示範每一題更好的答法。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ArrowLink href="/interview">免費開始模擬面試</ArrowLink>
              <ArrowLink href="/#how" variant="ghost">
                看看怎麼運作
              </ArrowLink>
            </div>
            <p className="mt-5 text-xs text-muted">免註冊 · 約 5 分鐘完成一場 · 繁體中文</p>
          </div>

          <div className="animate-rise [animation-delay:0.15s]">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* ── 數據列 ──────────────────────────────────────── */}
      <section className="border-y border-line bg-surface">
        <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px bg-line md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface px-4 py-8 sm:px-6">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className="mt-1 font-display text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 功能 ───────────────────────────────────────── */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Features</p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold sm:text-5xl">
            不只是題庫，
            <br />
            是會思考的面試官。
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className={`group rounded-3xl border border-line bg-surface p-7 transition hover:-translate-y-1 hover:border-ink ${f.wide ? "md:col-span-2" : ""}`}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-accent-ink">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  <path
                    d={f.icon}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-muted">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 流程 ───────────────────────────────────────── */}
      <section id="how" className="bg-ink text-paper">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">How it works</p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">三個步驟，開始演練。</h2>

          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-paper/20 pt-6">
                <span className="font-display text-6xl text-accent italic">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-paper/60">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 報告範例 ────────────────────────────────────── */}
      <section id="sample" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Report</p>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold sm:text-5xl">
              知道哪裡不夠好，
              <br />
              也知道怎麼答更好。
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-muted">
              每一題都有點評與示範回答。示範會延續你自己提到的經驗，用清楚的結構重新組織，讓你下次直接派上用場。
            </p>
            <div className="mt-8">
              <ArrowLink href="/interview">產生我的報告</ArrowLink>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6">
            <div className="text-xs font-semibold text-muted">第 2 題 · 逐題檢討</div>
            <p className="mt-2 font-medium">能具體說說你如何達成效能優化的嗎？</p>
            <div className="mt-5 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed">
              <div className="mb-1 text-xs font-semibold text-muted">你的回答</div>
              主要用圖片懶載入和 code splitting。
            </div>
            <div className="mt-3 rounded-2xl bg-accent-soft p-4 text-sm leading-relaxed">
              <div className="mb-1 text-xs font-semibold text-accent">點評</div>
              方向正確，但缺少「為什麼選這些手段」與量化結果。
            </div>
            <div className="mt-3 rounded-2xl bg-good-soft p-4 text-sm leading-relaxed">
              <div className="mb-1 text-xs font-semibold text-good">較佳的回答方式</div>
              「我先用 Lighthouse 找出首屏最大的瓶頸是商品大圖與過大的 JS bundle。針對圖片，我改用 next/image 搭配懶載入；針對
              bundle，依路由拆分並延後載入非首屏元件。最終 LCP 從 4 秒降到 1.8 秒，轉換率也提升了…」
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section id="faq" className="border-t border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">常見問題</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-lg font-medium">
                  {f.q}
                  <span className="chevron grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-12 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 最後 CTA ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-accent px-6 py-16 text-center text-accent-ink sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
          <h2 className="relative font-display text-4xl leading-tight font-semibold sm:text-5xl">
            下一場面試，
            <br className="sm:hidden" />
            從這裡開始準備。
          </h2>
          <p className="relative mx-auto mt-4 max-w-md opacity-85">
            不用註冊，貼上職缺描述，五分鐘後拿到你的檢討報告。
          </p>
          <Link
            href="/interview"
            className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition hover:scale-[1.03]"
          >
            立即開始模擬面試
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
