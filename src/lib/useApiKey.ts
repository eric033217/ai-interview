"use client";

import { useSyncExternalStore } from "react";
import { getApiKey, subscribeApiKey } from "./apiKey";

/**
 * 在元件中讀取目前的 API Key，Key 改變時元件會自動重新渲染。
 * 伺服器端渲染時沒有 localStorage，所以回傳空字串，
 * 由 useSyncExternalStore 在瀏覽器端接手，避免 hydration 不一致。
 */
export function useApiKey() {
  return useSyncExternalStore(subscribeApiKey, getApiKey, () => "");
}

/** 判斷是否已在瀏覽器端完成掛載（用來避免伺服器端先顯示「未設定」造成閃爍） */
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
