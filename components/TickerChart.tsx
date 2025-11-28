type TickerChartProps = {
  ticker: string;
  currentPrice: number;
  oneDayPct: number;
  oneWeekPct: number;
  oneMonthPct: number;
};

export function TickerChart({
  ticker,
  currentPrice,
  oneDayPct,
  oneWeekPct,
  oneMonthPct,
}: TickerChartProps) {
  const pointsPct = [0, oneDayPct, oneWeekPct, oneMonthPct];

  const max = Math.max(...pointsPct, 5);
  const min = Math.min(...pointsPct, -5);
  const range = max - min || 1;

  const normY = (value: number) =>
    80 - ((value - min) / range) * 60;

  const coords = pointsPct.map((v, i) => ({
    x: (i / 3) * 180,
    y: normY(v),
  }));

  const path = coords
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const avgTrend = (oneDayPct + oneWeekPct + oneMonthPct) / 3 || 0;
  const isUp = avgTrend >= 0;

  const lineColor = isUp ? "#22c55e" : "#fb7185";
  const fillColor = isUp ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)";

  const oneDayPrice = currentPrice * (1 + oneDayPct / 100);
  const oneWeekPrice = currentPrice * (1 + oneWeekPct / 100);
  const oneMonthPrice = currentPrice * (1 + oneMonthPct / 100);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-inner-bg)] p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="text-slate-300">
          Growth projection{" "}
          <span className="font-semibold text-emerald-400">{ticker}</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Based on AI estimates (educational only)
        </div>
      </div>

      <div className="relative h-32 w-full md:h-40">
        <svg viewBox="0 0 180 80" className="h-full w-full overflow-visible">
          {/* area under line */}
          <path d={`${path} L 180 80 L 0 80 Z`} fill={fillColor} stroke="none" />
          {/* main line */}
          <path
            d={path}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          {/* 0% axis */}
          <line
            x1={0}
            y1={normY(0)}
            x2={180}
            y2={normY(0)}
            stroke="rgba(148,163,184,0.35)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          {/* points */}
          {coords.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={lineColor} />
          ))}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2 text-[11px] text-slate-400">
        <div className="flex flex-col">
          <span>Today</span>
          <span className="font-medium text-slate-100">
            {currentPrice.toFixed(2)} $
          </span>
        </div>
        <div className="flex flex-col">
          <span>1d</span>
          <span className="font-medium text-emerald-300">
            {oneDayPct > 0 && "+"}
            {oneDayPct.toFixed(1)}% · {oneDayPrice.toFixed(2)} $
          </span>
        </div>
        <div className="flex flex-col">
          <span>1w</span>
          <span className="font-medium text-emerald-300">
            {oneWeekPct > 0 && "+"}
            {oneWeekPct.toFixed(1)}% · {oneWeekPrice.toFixed(2)} $
          </span>
        </div>
        <div className="flex flex-col">
          <span>1m</span>
          <span className="font-medium text-emerald-300">
            {oneMonthPct > 0 && "+"}
            {oneMonthPct.toFixed(1)}% · {oneMonthPrice.toFixed(2)} $
          </span>
        </div>
      </div>
    </div>
  );
}
