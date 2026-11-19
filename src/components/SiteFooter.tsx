import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/interview", label: "開始模擬面試" },
      { href: "/#features", label: "功能介紹" },
      { href: "/#how", label: "使用流程" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#faq", label: "常見問題" },
      { href: "/#sample", label: "評分報告範例" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            在真正的面試之前，先和 AI 面試官演練一次。量身出題、即時追問、逐題給你更好的答法。
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© Rehearse · AI 面試模擬器</span>
          <span>由 OpenAI 模型提供面試內容，結果僅供練習參考。</span>
        </div>
      </div>
    </footer>
  );
}
