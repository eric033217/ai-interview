/**
 * /api/interview — AI 面試 API
 *
 * 這支 API 是「無狀態」的：伺服器不記任何面試進度，
 * 每次前端都會把「職缺描述 + 題數 + 到目前為止的完整對話」一起送過來，
 * API 再根據「候選人已經回答了幾題」決定這次要做什麼：
 *
 *   已回答數 < 總題數  → 請 AI 出下一題（或針對上一題追問）
 *   已回答數 = 總題數  → 請 AI 評分，並給出每一題的點評與較佳回答方式
 *   已回答數 > 總題數  → 不合理的請求，回傳錯誤
 */

// OpenAI 官方 SDK，用來呼叫 ChatGPT 模型
import OpenAI from "openai";
// Next.js 提供的回應工具，可以方便地回傳 JSON 與 HTTP 狀態碼
import { NextResponse } from "next/server";
// 前後端共用的常數與型別（定義在 src/lib/interview.ts）
import {
  MAX_QUESTIONS, // 題數上限（10）
  MIN_QUESTIONS, // 題數下限（1）
  type ChatMessage, // 一則對話：{ role: "interviewer" | "candidate", content: string }
  type Evaluation, // 最終評分結果的結構
  type InterviewResponse, // API 回傳的兩種格式：出題 或 評分
  type QuestionReview, // 單一題的檢討：題目、回答、點評、較佳回答
} from "@/lib/interview";

// 使用的模型：優先讀環境變數 OPENAI_MODEL，沒設定就用 gpt-4o-mini（便宜又快）
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
// 職缺描述最多 5000 字，避免使用者貼超長內容浪費 token
const MAX_JD_LENGTH = 5000;
// 每則訊息最多 3000 字，超過的部分會被截掉
const MAX_ANSWER_LENGTH = 3000;

// 建立 OpenAI 客戶端，API Key 從 .env.local 的 OPENAI_API_KEY 讀取
// （放在函式外面，只會建立一次，之後每個請求共用）
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 小工具：回傳 400 Bad Request（代表「使用者送來的資料有問題」） */
function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * 驗證並整理前端送來的對話紀錄。
 * 因為前端資料不可信任（任何人都能直接打 API），所以要逐筆檢查：
 *   - 必須是陣列
 *   - 每筆的 role 只能是 "interviewer" 或 "candidate"
 *   - content 必須是字串
 * 只要有一筆不合格就回傳 null，合格的話回傳整理好的陣列。
 */
function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null;
  const result: ChatMessage[] = [];
  for (const m of value) {
    if (
      !m ||
      (m.role !== "interviewer" && m.role !== "candidate") ||
      typeof m.content !== "string"
    ) {
      return null;
    }
    // 只保留需要的兩個欄位（丟掉多餘欄位），並截斷過長的內容
    result.push({ role: m.role, content: m.content.slice(0, MAX_ANSWER_LENGTH) });
  }
  return result;
}

/**
 * 把我們自己的角色名稱轉成 OpenAI 看得懂的角色：
 *   interviewer（面試官）→ assistant（AI 自己說過的話）
 *   candidate（候選人）  → user（使用者說的話）
 * 這樣 AI 會把過去的題目當成「自己問過的」，接著對話下去。
 */
function toOpenAIMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
}

/**
 * AI 回傳的評分 JSON 的型別。
 * 全部欄位都是「可能有、可能沒有」（Partial），因為 AI 不一定照規格回答，
 * 後面使用前都要再檢查一次。questions 裡多了一個 index（題號）。
 */
type EvalJson = Partial<Omit<Evaluation, "questions">> & {
  questions?: (Partial<QuestionReview> & { index?: number })[];
};

/**
 * 把對話整理成「題目 → 回答」配對。
 * 規則：每遇到候選人的回答，就和「最近一次面試官說的話」配成一組。
 * 題目原文直接取自對話，不讓 AI 重述，確保畫面上顯示的題目跟當初問的一模一樣。
 *
 * 例：[面試官Q1, 候選人A1, 面試官Q2, 候選人A2]
 *   → [{question: Q1, answer: A1}, {question: Q2, answer: A2}]
 */
function pairQuestions(messages: ChatMessage[]) {
  const pairs: { question: string; answer: string }[] = [];
  let lastQuestion = "";
  for (const m of messages) {
    if (m.role === "interviewer") lastQuestion = m.content;
    else pairs.push({ question: lastQuestion, answer: m.content });
  }
  return pairs;
}

/**
 * POST /api/interview 的主程式。
 * 在 App Router 中，route.ts 匯出名為 POST 的函式，就代表處理這個路徑的 POST 請求。
 *
 * 前端送來的 body 格式：
 *   { jobDescription: string, totalQuestions: number, messages: ChatMessage[] }
 */
export async function POST(req: Request) {
  // ── 步驟 1：確認伺服器有設定 API Key ──────────────────────────
  // 沒有 Key 就不可能呼叫 OpenAI，直接回 500（伺服器設定錯誤，不是使用者的錯）
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "伺服器未設定 OPENAI_API_KEY" }, { status: 500 });
  }

  // ── 步驟 2：解析請求的 JSON ─────────────────────────────────
  // 如果前端送來的不是合法 JSON，req.json() 會丟錯誤，這裡接住並回 400
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("請求格式錯誤");
  }

  // 從 body 取出三個欄位（此時型別都還是 unknown，接下來逐一驗證）
  const {
    jobDescription,
    totalQuestions,
    messages: rawMessages,
  } = (body ?? {}) as Record<string, unknown>;

  // ── 步驟 3：驗證輸入 ────────────────────────────────────────
  // 3-1 職缺描述：必須是字串、不能是空白
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return badRequest("請提供職缺描述");
  }
  // 3-2 職缺描述：不能太長
  if (jobDescription.length > MAX_JD_LENGTH) {
    return badRequest(`職缺描述請勿超過 ${MAX_JD_LENGTH} 字`);
  }
  // 3-3 題數：必須是 1～10 的整數（字串 "3"、小數 2.5 都不接受）
  if (
    typeof totalQuestions !== "number" ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions < MIN_QUESTIONS ||
    totalQuestions > MAX_QUESTIONS
  ) {
    return badRequest(`題數需為 ${MIN_QUESTIONS} 到 ${MAX_QUESTIONS} 之間的整數`);
  }
  // 3-4 對話紀錄：第一次開始面試時前端可能沒傳，就當作空陣列
  const messages = parseMessages(rawMessages ?? []);
  if (!messages) return badRequest("對話紀錄格式錯誤");

  // ── 步驟 4：計算進度 ────────────────────────────────────────
  // 數一數候選人回答了幾次 = 已經答了幾題
  const answered = messages.filter((m) => m.role === "candidate").length;
  // 回答數比總題數還多，代表面試早就該結束了
  if (answered > totalQuestions) return badRequest("面試已結束");

  // ── 步驟 5：準備共用的系統提示詞（System Prompt）────────────────
  // System Prompt 是給 AI 的「角色設定」，告訴它扮演誰、背景是什麼。
  // 出題和評分兩個階段都會用到這段，所以先組好。
  const baseSystem = `你是一位專業、友善但嚴謹的面試官，正在用繁體中文進行模擬面試。
以下是應徵的職缺描述：
"""
${jobDescription.trim()}
"""
本場面試共 ${totalQuestions} 題。`;

  // 以下會呼叫 OpenAI，網路或 AI 都可能出錯，所以整段包在 try/catch 裡
  try {
    // ════════════════════════════════════════════════════════
    // 階段 A：還沒答完 → 出下一題
    // ════════════════════════════════════════════════════════
    if (answered < totalQuestions) {
      // 這次要問的是第幾題（已答 0 題 → 問第 1 題，以此類推）
      const questionNumber = answered + 1;

      // 依照是不是第一題，給 AI 不同的指示
      const instruction =
        questionNumber === 1
          ? // 第一題：打招呼 + 出題
            "請先用一句話簡短打招呼，然後提出第 1 題，題目需與職缺內容高度相關。"
          : // 之後的題目：讓 AI 自己判斷要「追問」還是「換新題目」
            `候選人剛回答了上一題。請根據他的回答決定：若回答不夠完整或有值得深入之處，就針對回答追問；否則提出一個新的、與職缺相關的題目。這是第 ${questionNumber} 題（共 ${totalQuestions} 題）。可以先用一句話簡短回應他的回答，但不要給評分。`;

      // 呼叫 OpenAI Chat Completions API
      const completion = await openai.chat.completions.create({
        model: MODEL,
        // temperature 控制隨機性（0～2）：0.7 讓題目有些變化，不會每次都一樣
        temperature: 0.7,
        messages: [
          // 第一則：系統提示詞（角色設定 + 本次指示 + 格式要求）
          {
            role: "system",
            content: `${baseSystem}\n${instruction}\n一次只問一個問題，不要列出多題，回覆保持精簡。`,
          },
          // 接著放入完整的歷史對話，讓 AI 知道之前問過什麼、候選人答了什麼
          ...toOpenAIMessages(messages),
        ],
      });

      // 取出 AI 的回覆文字（?. 是「有才取，沒有就給 undefined」，避免程式當掉）
      const question = completion.choices[0]?.message?.content?.trim();
      // AI 回了空白 → 當作錯誤，交給下面的 catch 處理
      if (!question) throw new Error("Empty response");

      // 回傳「出題」格式給前端
      const res: InterviewResponse = { type: "question", question, questionNumber };
      return NextResponse.json(res);
    }

    // ════════════════════════════════════════════════════════
    // 階段 B：全部答完 → 評分 + 每題的點評與較佳回答
    // ════════════════════════════════════════════════════════

    // B-1 把對話整理成「題目 → 回答」配對
    const pairs = pairQuestions(messages);

    // B-2 組成有編號的逐字稿，例如：
    //   【第 1 題】
    //   面試官：……
    //   候選人：……
    // 明確的題號能讓 AI 比較不會漏題，回傳時也能用題號對應
    const transcript = pairs
      .map((p, i) => `【第 ${i + 1} 題】\n面試官：${p.question}\n候選人：${p.answer}`)
      .join("\n\n");

    // parsed：存整體評分（分數、評語、優缺點），以第一次 AI 的回覆為準
    let parsed: EvalJson = {};
    // reviews：存每題的檢討，key 是題目索引（從 0 開始），value 是點評與較佳回答
    // 用 Map 可以方便判斷「哪幾題已經拿到了」
    const reviews = new Map<number, Partial<QuestionReview>>();

    // B-3 呼叫 AI 評分。AI 偶爾會漏掉某幾題的檢討，所以最多跑 2 次：
    //   第 1 次：拿到整體評分 + 大部分（通常是全部）題目的檢討
    //   第 2 次：只有在還有題目缺漏時才會跑，用來補齊缺的題目
    for (let attempt = 0; attempt < 2 && reviews.size < pairs.length; attempt++) {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        // 評分要穩定一點，所以 temperature 設低
        temperature: 0.3,
        // 強制 AI 只能輸出合法的 JSON，方便程式解析
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            // 告訴 AI 要做什麼，以及要回傳的 JSON 長什麼樣子
            content: `${baseSystem}
面試已經結束。請根據逐字稿，評估候選人與此職缺的適配度與回答品質，並針對「每一題」都給出點評與「較佳的回答方式」。
較佳回答方式請寫成候選人可以直接參考的示範回答（可用 STAR 等結構，貼合職缺需求，並盡量延續候選人自己提到的經驗），約 100-200 字。
只輸出以下 JSON 格式（繁體中文）。questions 陣列必須包含第 1 到第 ${pairs.length} 題，共 ${pairs.length} 個元素，一題都不能少：
{
  "score": 0 到 100 的整數,
  "summary": "整體評語，2-3 句",
  "strengths": ["優點1", "優點2"],
  "improvements": ["具體改進建議1", "具體改進建議2"],
  "questions": [
    { "index": 題號(從1開始), "feedback": "對這題回答的點評", "betterAnswer": "較佳的回答方式（示範回答）" }
  ]
}`,
          },
          // 評分時不用一來一往的對話格式，而是把整份逐字稿當成一則訊息交給 AI
          { role: "user", content: `面試逐字稿：\n\n${transcript}` },
        ],
      });

      // 把 AI 回傳的 JSON 字串轉成物件（萬一格式壞掉會丟錯，由 catch 處理）
      const current = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as EvalJson;
      // 整體評分只採用第一次的結果
      if (attempt === 0) parsed = current;

      // 逐一處理 AI 給的每題檢討
      for (const [i, r] of (Array.isArray(current.questions) ? current.questions : []).entries()) {
        // 優先用 AI 標的題號（從 1 開始，所以 -1 轉成索引）；沒標就用它在陣列裡的位置
        const idx = Number.isInteger(r?.index) ? Number(r.index) - 1 : i;
        // 只收下：題號在合理範圍內、真的有寫較佳回答、而且這題之前還沒拿到的
        if (idx >= 0 && idx < pairs.length && r?.betterAnswer && !reviews.has(idx)) {
          reviews.set(idx, r);
        }
      }
      // 迴圈條件會再檢查 reviews.size < pairs.length：
      // 全部題目都拿到了就不會跑第 2 次
    }

    // B-4 組出最終結果。AI 的回覆不完全可信，所以每個欄位都再整理一次：
    const evaluation: Evaluation = {
      // 分數：轉成數字、四捨五入，並限制在 0～100（轉不成數字就給 0）
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      // 評語：轉成字串，沒有就給空字串
      summary: String(parsed.summary ?? ""),
      // 優點／改進建議：確定是陣列才用，並把每一項轉成字串
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
      // 每題檢討：題目和回答用我們自己整理的原文，點評和較佳回答才用 AI 的
      // 如果某題最後還是沒拿到，就給空字串（前端會自動隱藏空的區塊）
      questions: pairs.map((p, i) => ({
        question: p.question,
        answer: p.answer,
        feedback: String(reviews.get(i)?.feedback ?? ""),
        betterAnswer: String(reviews.get(i)?.betterAnswer ?? ""),
      })),
    };

    // 回傳「評分」格式給前端
    const res: InterviewResponse = { type: "evaluation", evaluation };
    return NextResponse.json(res);
  } catch (err) {
    // 任何 OpenAI 呼叫失敗、AI 回空白、JSON 解析失敗都會到這裡
    // 詳細錯誤只印在伺服器的終端機（方便除錯），不把內部細節傳給使用者
    console.error("[/api/interview]", err);
    // 502 Bad Gateway：代表「我們依賴的外部服務（OpenAI）出問題」
    return NextResponse.json({ error: "AI 服務暫時無法回應，請稍後再試" }, { status: 502 });
  }
}
