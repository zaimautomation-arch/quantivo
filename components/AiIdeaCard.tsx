"use client";

import { useState } from "react";
import type { InvestmentIdeaWithPrice } from "../app/ai/page";
import { TickerChart } from "./TickerChart";

// calcola target price dato prezzo attuale e percentuale stimata
function calcTargetPrice(priceNow: number | null, pct: number): number | null {
  if (!priceNow || priceNow === 0 || isNaN(pct)) return null;
  return priceNow * (1 + pct / 100);
}

function percentClass(pct: number) {
  if (pct > 0) return "text-emerald-400";
  if (pct < 0) return "text-rose-400";
  return "text-slate-300";
}

export default function AiIdeaCard({ idea }: { idea: InvestmentIdeaWithPrice }) {
  const [showChart, setShowChart] = useState(false);

  const { priceNow } = idea;

  const target1D = calcTargetPrice(priceNow, idea.oneDayPct);
  const target1W = calcTargetPrice(priceNow, idea.oneWeekPct);
  const target1M = calcTargetPrice(priceNow, idea.oneMonthPct);

  return (
    <article className="group space-y-3 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-soft transition-transform duration-150 hover:-translate-y-1 hover:shadow-2xl">
      {/* intestazione card */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="rounded-xl bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
              {idea.ticker}
            </span>
            <span className="text-[11px] uppercase text-slate-400">
              {idea.kind}
            </span>
          </h2>
          <p className="mt-2 text-xs text-slate-300">{idea.reason}</p>
        </div>

        <div className="text-right text-xs">
          <div className="text-slate-400">AI score</div>
          <div className="text-xl font-semibold text-emerald-400">
            {Math.round(idea.score)}
          </div>
          {priceNow !== null && (
            <div className="mt-1 text-[11px] text-slate-400">
              Current price:{" "}
              <span className="text-slate-100">
                {priceNow.toFixed(2)} $
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3 quadrati 1d / 1w / 1m */}
      <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-inner-bg)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1 day (est.)</span>
            <span className={`text-sm font-semibold ${percentClass(idea.oneDayPct)}`}>
              {idea.oneDayPct > 0 && "+"}
              {idea.oneDayPct.toFixed(1)}%
            </span>
          </div>
          {target1D && priceNow !== null && (
            <div className="mt-1 text-[11px] text-slate-400">
              Target:{" "}
              <span className="font-medium text-emerald-300">
                {target1D.toFixed(2)} $
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-inner-bg)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1 week (est.)</span>
            <span className={`text-sm font-semibold ${percentClass(idea.oneWeekPct)}`}>
              {idea.oneWeekPct > 0 && "+"}
              {idea.oneWeekPct.toFixed(1)}%
            </span>
          </div>
          {target1W && priceNow !== null && (
            <div className="mt-1 text-[11px] text-slate-400">
              Target:{" "}
              <span className="font-medium text-emerald-300">
                {target1W.toFixed(2)} $
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-inner-bg)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1 month (est.)</span>
            <span className={`text-sm font-semibold ${percentClass(idea.oneMonthPct)}`}>
              {idea.oneMonthPct > 0 && "+"}
              {idea.oneMonthPct.toFixed(1)}%
            </span>
          </div>
          {target1M && priceNow !== null && (
            <div className="mt-1 text-[11px] text-slate-400">
              Target:{" "}
              <span className="font-medium text-emerald-300">
                {target1M.toFixed(2)} $
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottone Mostra/Nascondi grafico */}
      <button
        type="button"
        onClick={() => setShowChart((s) => !s)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-400/80 md:text-sm"
      >
        <span>{showChart ? "Hide chart" : "Show chart"}</span>
      </button>

      {/* Grafico crescita 1d / 1w / 1m */}
      {showChart && priceNow !== null && (
        <div className="mt-3">
          <TickerChart
            ticker={idea.ticker}
            currentPrice={priceNow}
            oneDayPct={idea.oneDayPct}
            oneWeekPct={idea.oneWeekPct}
            oneMonthPct={idea.oneMonthPct}
          />
        </div>
      )}
    </article>
  );
}
