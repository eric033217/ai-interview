"use client";

import { openSettings } from "@/lib/apiKey";
import { useApiKey, useHydrated } from "@/lib/useApiKey";

/** Header 上的設定按鈕：右上角小圓點顯示 Key 是否已設定 */
export default function SettingsButton() {
  const apiKey = useApiKey();
  const hydrated = useHydrated();

  return (
    <button
      type="button"
      onClick={openSettings}
      aria-label={apiKey ? "設定（API Key 已設定）" : "設定（尚未設定 API Key）"}
      title="API Key 設定"
      className="relative grid size-9 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-ink hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
        <path
          d="M14.5 9.5a3.5 3.5 0 1 1-1.02-2.48L20 13.5V16h-2.5v2H15v-2.5l-1.52-1.52"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hydrated && (
        <span
          className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-paper ${apiKey ? "bg-good" : "bg-accent"}`}
        />
      )}
    </button>
  );
}
