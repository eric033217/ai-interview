/**
 * BYOK（Bring Your Own Key）共用設定與瀏覽器端的 Key 儲存。
 *
 * 使用者的 OpenAI API Key 只存在他自己瀏覽器的 localStorage，
 * 呼叫 /api/interview 時放在 HTTP Header 帶給伺服器。
 */

/** 前端送 Key 給 API 用的 Header 名稱 */
export const API_KEY_HEADER = "x-openai-api-key";

/** localStorage 裡存放 Key 的欄位名稱 */
const STORAGE_KEY = "rehearse.openaiApiKey";

/** 在同一個分頁內通知「Key 改變了」用的自訂事件 */
const CHANGE_EVENT = "rehearse:api-key-change";

/** 要求開啟「設定」視窗的自訂事件（任何元件都可以觸發） */
export const OPEN_SETTINGS_EVENT = "rehearse:open-settings";

/** 粗略檢查格式：OpenAI Key 以 sk- 開頭，且只含英數、底線、連字號 */
export function isPlausibleApiKey(key: string) {
  return /^sk-[A-Za-z0-9_-]{20,300}$/.test(key);
}

/** 顯示用：只露出頭尾，例如 sk-proj…a1B2 */
export function maskApiKey(key: string) {
  if (key.length <= 12) return "•".repeat(key.length);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

/** 讀取 Key。localStorage 在無痕模式或被封鎖時可能丟錯，所以包 try/catch */
export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** 儲存 Key（傳空字串代表清除），並通知所有正在使用的元件更新 */
export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無法寫入時就只在記憶體中生效（重新整理後會消失）
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * 給 React useSyncExternalStore 用的訂閱函式。
 * 同時監聽：同分頁的自訂事件 + 其他分頁改動 localStorage 時的 storage 事件。
 */
export function subscribeApiKey(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

/** 開啟設定視窗 */
export function openSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
