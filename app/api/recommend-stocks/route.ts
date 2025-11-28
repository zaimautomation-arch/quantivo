// app/api/recommend-stocks/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { UNIVERSE_STOCKS } from "../../../lib/universeStocks";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // per non esagerare, prendiamo solo le prime 200 per la demo
    const universe = UNIVERSE_STOCKS.slice(0, 200);

    const prompt = `
Ti passo una lista di azioni con ticker, nome, settore e borsa.
Devi scegliere le 10 azioni più interessanti da STUDIARE oggi
(a scopo puramente educativo), considerando in generale:
- qualità dell'azienda
- importanza nel suo settore
- esposizione geografica
- diversificazione tra settori e regioni

NON hai accesso ai prezzi in tempo reale in questa versione, quindi
non inventare numeri precisi sul prezzo. Puoi parlare solo in modo qualitativo.

Output richiesto: SOLO JSON valido, in questo formato:

{
  "stocks": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "exchange": "NASDAQ",
      "score": 0.0,
      "reason": "Breve motivo in italiano."
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Sei un assistente di educazione finanziaria. Non dai mai consigli di acquisto o vendita, solo spunti da studiare.",
        },
        {
          role: "user",
          content:
            prompt +
            "\n\nEcco la lista di azioni in formato JSON:\n" +
            JSON.stringify({ stocks: universe }),
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Errore /api/recommend-stocks:", err);
    return NextResponse.json(
      { error: "Errore nel generare le raccomandazioni" },
      { status: 500 }
    );
  }
}
