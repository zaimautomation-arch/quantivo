// lib/marketData.ts

const FINNHUB_KEY = process.env.FINNHUB_KEY;

if (!FINNHUB_KEY) {
  console.error(
    "[Finnhub] Nessuna chiave FINNHUB_KEY trovata (.env.local)."
  );
  throw new Error("FINNHUB_KEY mancante");
}

export type Quote = {
  ticker: string;
  price: number;
  high: number | null;
  low: number | null;
  open: number | null;
  prevClose: number | null;
};

export type CandlePoint = {
  time: number; // timestamp (secondi)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// 🔹 Cache in memoria per i prezzi (10 minuti)
const QUOTE_TTL_MS = 10 * 60 * 1000;
const quoteCache = new Map<string, { quote: Quote; at: number }>();

// flag per evitare di martellare Finnhub dopo un rate limit
let rateLimitedUntil: number | null = null;

// ---------- QUOTE ----------

// chiamata “cruda” a Finnhub (senza cache)
async function fetchQuoteFromApi(ticker: string): Promise<Quote | null> {
  if (rateLimitedUntil && Date.now() < rateLimitedUntil) {
    console.warn("[Finnhub] In rate limit, salto chiamata per", ticker);
    return null;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      ticker
    )}&token=${FINNHUB_KEY}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text();

      if (text.includes("API limit reached")) {
        console.warn("[Finnhub] API limit reached, stop per 60s.");
        rateLimitedUntil = Date.now() + 60_000;
      } else {
        console.warn("Errore Finnhub per", ticker, text);
      }

      return null;
    }

    const d = await res.json();

    return {
      ticker,
      price: typeof d.c === "number" ? d.c : 0,
      high: typeof d.h === "number" ? d.h : null,
      low: typeof d.l === "number" ? d.l : null,
      open: typeof d.o === "number" ? d.o : null,
      prevClose: typeof d.pc === "number" ? d.pc : null,
    };
  } catch (err) {
    console.warn("Errore fetchQuote Finnhub", ticker, err);
    return null;
  }
}

// export con cache
export async function fetchQuote(ticker: string): Promise<Quote | null> {
  const cached = quoteCache.get(ticker);
  if (cached && Date.now() - cached.at < QUOTE_TTL_MS) {
    return cached.quote;
  }

  const q = await fetchQuoteFromApi(ticker);
  if (q) {
    quoteCache.set(ticker, { quote: q, at: Date.now() });
  }

  return q;
}

// più ticker, ma in modo “gentile” con il rate limit
export async function fetchQuotes(tickers: string[]): Promise<Quote[]> {
  // deduplica e limita a 60 ticker (30 stocks + 5 crypto + 25 ETF)
  const unique = Array.from(new Set(tickers));
  const limited = unique.slice(0, 60);
  const results: Quote[] = [];

  // piccola concorrenza (3 richieste in parallelo)
  const concurrency = 3;
  let index = 0;

  async function worker() {
    while (index < limited.length) {
      const i = index++;
      const symbol = limited[i];
      const q = await fetchQuote(symbol);
      if (q) results.push(q);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
}

// ---------- CANDLES PER I GRAFICI ----------

export async function fetchDailyCandles(
  ticker: string,
  days: number = 90
): Promise<CandlePoint[]> {
  if (rateLimitedUntil && Date.now() < rateLimitedUntil) {
    console.warn("[Finnhub] In rate limit, salto candles per", ticker);
    return [];
  }

  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 24 * 60 * 60;

  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(
    ticker
  )}&resolution=D&from=${from}&to=${now}&token=${FINNHUB_KEY}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    if (text.includes("API limit reached")) {
      console.warn("[Finnhub] API limit reached (candles), stop per 60s.");
      rateLimitedUntil = Date.now() + 60_000;
    } else {
      console.warn("Errore Finnhub candles per", ticker, text);
    }
    return [];
  }

  const d = await res.json();

  if (d.s !== "ok" || !Array.isArray(d.t)) {
    console.warn("Candles non valide per", ticker, d);
    return [];
  }

  const out: CandlePoint[] = [];
  for (let i = 0; i < d.t.length; i++) {
    out.push({
      time: d.t[i],
      open: d.o[i],
      high: d.h[i],
      low: d.l[i],
      close: d.c[i],
      volume: d.v[i],
    });
  }

  return out;
}
