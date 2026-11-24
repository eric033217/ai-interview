"use client";

import { useEffect, useRef, useState } from "react";
import {
  OPEN_SETTINGS_EVENT,
  isPlausibleApiKey,
  maskApiKey,
  setApiKey,
} from "@/lib/apiKey";
import { useApiKey } from "@/lib/useApiKey";

/**
 * API Key 設定視窗（全站只放一個，掛在 layout）。
 * 任何地方呼叫 openSettings() 都會打開它。
 */
export default function ApiKeySettings() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savedKey = useApiKey();
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // 監聽「開啟設定」事件
  useEffect(() => {
    const open = () => {
      setDraft("");
      setReveal(false);
      setError(null);
      setJustSaved(false);
      dialogRef.current?.showModal();
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const key = draft.trim();
    if (!isPlausibleApiKey(key)) {
      setError("格式不正確：OpenAI API Key 應以 sk- 開頭。");
      return;
    }
    setApiKey(key);
    setDraft("");
    setError(null);
    setJustSaved(true);
    setTimeout(close, 700);
  }

  function clear() {
    setApiKey("");
    setDraft("");
    setJustSaved(false);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      onClick={(e) => {
        // 點背景（dialog 本身）關閉
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-surface p-0 text-ink shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={save} className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Settings</p>
            <h2 id="settings-title" className="mt-1 font-display text-3xl font-semibold">
              OpenAI API Key
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="關閉"
            className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          Rehearse 使用你自己的 OpenAI API Key 進行面試，費用會計入你的 OpenAI 帳號。可到{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2"
          >
            OpenAI 後台
          </a>{" "}
          建立一把。
        </p>

        {/* 目前狀態 */}
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`size-2 shrink-0 rounded-full ${savedKey ? "bg-good" : "bg-accent"}`} />
            {savedKey ? (
              <span className="truncate">
                已設定 <span className="font-mono text-muted">{maskApiKey(savedKey)}</span>
              </span>
            ) : (
              <span className="text-muted">尚未設定</span>
            )}
          </div>
          {savedKey && (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 text-xs font-medium text-muted transition hover:text-accent"
            >
              清除
            </button>
          )}
        </div>

        {/* 輸入新 Key */}
        <label htmlFor="api-key" className="mt-6 block text-sm font-semibold">
          {savedKey ? "更換 API Key" : "輸入 API Key"}
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line bg-paper pr-2 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
          <input
            id="api-key"
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted/60"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition hover:text-ink"
          >
            {reveal ? "隱藏" : "顯示"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}

        <ul className="mt-5 space-y-1.5 text-xs leading-relaxed text-muted">
          <li>• Key 只儲存在這個瀏覽器的 localStorage，不會存到我們的伺服器。</li>
          <li>• 每次出題與評分時會隨請求傳送，由伺服器轉交給 OpenAI 後即丟棄。</li>
          <li>• 在公用電腦上使用後，記得按「清除」。</li>
        </ul>

        <div className="mt-7 flex justify-end gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition hover:border-ink"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!draft.trim() || justSaved}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {justSaved ? "已儲存 ✓" : "儲存"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
