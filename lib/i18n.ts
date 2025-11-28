// lib/i18n.ts
export type LangCode =
  | "en"
  | "it"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "zh"
  | "ja"
  | "ko"
  | "hi";

export const SUPPORTED_LANGS: LangCode[] = [
  "en",
  "it",
  "es",
  "fr",
  "de",
  "pt",
  "zh",
  "ja",
  "ko",
  "hi",
];

export function normalizeLang(raw?: string | null): LangCode {
  if (!raw) return "en";
  const base = raw.toLowerCase().split("-")[0] as LangCode;
  const supported: LangCode[] = ["en","it","es","fr","de","pt","zh","ja","ko","hi"];
  return supported.includes(base) ? base : "en";
}

// Mini dizionario di esempio (puoi espanderlo)
export const messages: Record<LangCode, Record<string, string>> = {
  en: {
    nav_home: "Home",
    nav_ai: "Quantivo AI",
    nav_chat: "Chat",
    nav_account: "Account",

    ai_title: "Quantivo AI",
    ai_subtitle:
      "Quantivo's performance estimates are generated with an AI model trained on historical data of indices, stocks and crypto. Educational only.",

    chat_title: "Quantivo Chat",
    chat_subtitle:
      "Ask questions about finance and investing. Educational answers only, never financial advice.",
  },
  it: {
    nav_home: "Home",
    nav_ai: "Quantivo AI",
    nav_chat: "Chat",
    nav_account: "Account",

    ai_title: "Quantivo AI",
    ai_subtitle:
      "Le stime di performance di Quantivo sono generate da un modello di AI addestrato su dati storici di indici, azioni e crypto. Solo a scopo educativo.",

    chat_title: "Quantivo Chat",
    chat_subtitle:
      "Fai domande su finanza e investimenti. Solo scopo educativo, mai consulenza finanziaria.",
  },
  zh: {
    nav_home: "首页",
    nav_ai: "Quantivo AI",
    nav_chat: "聊天",
    nav_account: "账户",

    ai_title: "Quantivo AI",
    ai_subtitle:
      "Quantivo 的收益预估基于 AI 模型，对历史指数、股票和加密资产数据进行分析。仅供学习参考，不构成投资建议。",
    chat_title: "Quantivo 聊天",
    chat_subtitle:
      "可以向我提问理财和投资相关的问题。回答仅为教育用途，不构成任何投资建议。",
  },
  // le altre lingue puoi copiarle da en e tradurre pian piano
  es: {},
  fr: {},
  de: {},
  pt: {},
  ja: {},
  ko: {},
  hi: {},
};
