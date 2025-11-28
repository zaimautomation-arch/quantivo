// lib/historyData.ts

const ALPHA_KEY = process.env.ALPHAVANTAGE_KEY!;

export type HistoryPoint = {
  time: number; // ms
  close: number;
};

export type RangeKey = "1D" | "1W" | "1M";

// cache in memoria per ridurre le chiamate
const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const cache = new Map<string, { at: number; data: HistoryPoint[] }>();

export async function fetchHistory(
  ticker: string,
  range: RangeKey
): Promise<HistoryPoint[]> {
  const key = `${ticker}-${range}`;
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.at < FIFTEEN_MIN_MS) {
    return cached.data;
  }

  if (!ALPHA_KEY) {
    console.error("ALPHAVANTAGE_KEY mancante");
    return [];
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
    ticker
  )}&outputsize=compact&apikey=${ALPHA_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("Errore Alpha Vantage HTTP:", ticker, res.status);
      return [];
    }

    const json = await res.json();

    // Alpha Vantage segnala errori/rate limit con questi campi
    if (json["Error Message"] || json["Note"]) {
      console.error("Errore Alpha Vantage:", ticker, json);
      return [];
    }

    const series = json["Time Series (Daily)"];
    if (!series || typeof series !== "object") {
      console.error("Formato Time Series (Daily) non valido per", ticker, json);
      return [];
    }

    // entries = [ ["2024-11-26", { "4. close": "280.12", ... }], ... ]
    const entries = Object.entries(series) as [string, any][];

    // ordina per data crescente
    entries.sort(
      (a, b) =>
        new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    // quanti giorni tenere in base al range
    const maxPoints =
      range === "1D" ? 3 : range === "1W" ? 10 : 40; // piccoli buffer

    const sliced = entries.slice(-maxPoints);

    const points: HistoryPoint[] = sliced
      .map(([dateStr, values]) => {
        const closeStr =
          values["4. close"] ?? values["5. adjusted close"] ?? "0";
        const close = parseFloat(closeStr);
        if (Number.isNaN(close)) return null;

        // interpretiamo la data come UTC
        const time = new Date(dateStr + "T00:00:00Z").getTime();

        return { time, close };
      })
      .filter((p): p is HistoryPoint => p !== null);

    cache.set(key, { at: now, data: points });
    return points;
  } catch (err) {
    console.error("Eccezione fetchHistory Alpha Vantage:", err);
    return [];
  }
}
