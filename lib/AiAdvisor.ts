// lib/AiAdvisor.ts
import OpenAI from "openai";
import { fetchQuotes, type Quote } from "./marketData";
import { UNIVERSE_STOCKS } from "./universeStocks";
import { UNIVERSE_CRYPTO } from "./universeCrypto";
import { UNIVERSE_ETF } from "./universeEtf";
import type { LangCode } from "./i18n";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type InvestmentIdea = {
  ticker: string;
  kind: "stock" | "crypto" | "etf";
  score: number;
  reason: string;
  oneDayPct: number;
  oneWeekPct: number;
  oneMonthPct: number;
};

export type AIResult = {
  ideas: InvestmentIdea[];
  prices: Quote[];
};

// 🚀 CACHE IN MEMORIA (valida 3 ore, per lingua)
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
let cachedResult: AIResult | null = null;
let cachedAt: number | null = null;
let cachedLang: LangCode | null = null;

export async function getAIInvestmentIdeas(
  lang: LangCode = "en"
): Promise<AIResult> {
  const now = Date.now();

  // Se abbiamo dati in cache *per quella lingua* e non sono vecchi
  if (
    cachedResult &&
    cachedAt &&
    cachedLang === lang &&
    now - cachedAt < THREE_HOURS_MS
  ) {
    console.log("[AIAdvisor] Uso risultato in cache (meno di 3 ore fa) per lang:", lang);
    return cachedResult;
  }

  console.log("[AIAdvisor] Cache scaduta/lingua diversa, chiamo Finnhub + OpenAI. lang:", lang);

  // Limito l'universo per non far esplodere i token e il rate limit Finnhub
  const stocks = UNIVERSE_STOCKS.slice(0, 15);
  const crypto = UNIVERSE_CRYPTO.slice(0, 5);
  const etf = UNIVERSE_ETF.slice(0, 10);

  const allTickers = [
    ...stocks.map((s) => s.ticker),
    ...crypto.map((c) => c.ticker),
    ...etf.map((e) => e.ticker),
  ];

  // Prezzi reali (se Finnhub è in rate-limit, molte saranno null)
  const prices = await fetchQuotes(allTickers);

  const dataToSend = { stocks, crypto, etf, prices };

  const prompt = `
You are an educational financial analyst.

Language:
- ALWAYS respond in this language: ${lang}.

Task:
- Analyze the following instruments (stocks, crypto, ETFs).
- You NEVER give direct buy/sell orders, only ideas to study.
- Focus on medium–long term reasoning, risk, diversification and context.

For each instrument you select as interesting, provide:

- "ticker": symbol (e.g. "AAPL")
- "kind": one of "stock" | "crypto" | "etf"
- "score": a 0–100 score of how interesting it is to STUDY today
- "reason": a short explanation in the selected language (no more than 2–3 sentences)
- hypothetical percentage moves (NOT real forecasts, just educational examples):
    - "oneDayPct": estimated % move in 1 day
    - "oneWeekPct": estimated % move in 1 week
    - "oneMonthPct": estimated % move in 1 month

IMPORTANT:
- These percentages are ONLY hypothetical and educational.
- Do NOT use extreme values: usually between -10% and +10% in a day,
  -20% / +20% in a week, and -40% / +40% in a month in more extreme cases.
- If you have no idea, use 0.

Output format: ONLY valid JSON, like:

{
  "ideas": [
    {
      "ticker": "AAPL",
      "kind": "stock",
      "score": 85,
      "reason": "Short explanation in the selected language...",
      "oneDayPct": 1.5,
      "oneWeekPct": 4.2,
      "oneMonthPct": 8.0
    }
  ]
}

Maximum 10 ideas.
`;

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant for financial education. You never give direct trading signals or personalized investment advice.",
      },
      {
        role: "user",
        content: prompt + "\n\nData:\n" + JSON.stringify(dataToSend),
      },
    ],
  });

  const content = ai.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Nessun contenuto restituito da OpenAI");
  }

  console.log("RISPOSTA GREZZA CHATGPT AIAdvisor:", content);

  const parsed = JSON.parse(content as string) as { ideas?: InvestmentIdea[] };

  const result: AIResult = {
    ideas: parsed.ideas ?? [],
    prices,
  };

  // 🔒 salviamo in cache anche la lingua
  cachedResult = result;
  cachedAt = now;
  cachedLang = lang;

  return result;
}
