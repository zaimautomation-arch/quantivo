// app/stocks/[ticker]/page.tsx

export default function StockDetailPage({ params }: { params: { ticker?: string } }) {
  const ticker = params?.ticker ?? "N/D";

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">
        Dettaglio azione: {ticker.toUpperCase()}
      </h1>

      <p className="text-sm text-slate-400">
        Qui in futuro mostreremo grafici, dati fondamentali, news e l’analisi AI.
      </p>
    </div>
  );
}
