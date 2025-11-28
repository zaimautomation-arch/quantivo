// app/api/history/route.ts
import { NextResponse } from "next/server";
import { fetchHistory, RangeKey } from "../../../lib/historyData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");
  const range = (searchParams.get("range") as RangeKey | null) ?? "1M";

  if (!ticker) {
    return NextResponse.json(
      { error: "Missing ticker" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchHistory(ticker, range);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Errore /api/history:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
