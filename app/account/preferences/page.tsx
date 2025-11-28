// app/account/preferences/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Profile = {
  id: string;
  risk_level: string | null;
  markets: string | null;
  sectors: string | null;
  ai_style: string | null;
  // opzionale: se in futuro aggiungi una colonna "theme" in Supabase
  theme?: string | null;
};

export default function PreferencesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [risk, setRisk] = useState("medio");
  const [markets, setMarkets] = useState("USA,EU");
  const [sectors, setSectors] = useState("Tech,Healthcare");
  const [aiStyle, setAiStyle] = useState("educativo");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (error) {
        console.error("Errore caricamento profilo:", error);
        setLoading(false);
        return;
      }

      if (prof) {
        const p: Profile = {
          id: prof.id,
          risk_level: prof.risk_level,
          markets: prof.markets,
          sectors: prof.sectors,
          ai_style: prof.ai_style,
          theme: prof.theme ?? null,
        };
        setProfile(p);
        if (p.risk_level) setRisk(p.risk_level);
        if (p.markets) setMarkets(p.markets);
        if (p.sectors) setSectors(p.sectors);
        if (p.ai_style) setAiStyle(p.ai_style);

        // tema da profilo o da localStorage
        const stored =
          (localStorage.getItem("quantivo-theme") as "dark" | "light" | null) ||
          (p.theme as "dark" | "light" | null) ||
          "dark";
        setTheme(stored);
        document.documentElement.dataset.theme = stored;
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Caricamento preferenze…</p>
      </div>
    );

  if (!profile)
    return (
      <p className="p-6 text-sm text-slate-400">
        Nessun profilo trovato. Assicurati di essere loggato.
      </p>
    );

  async function save() {
    setInfo("");

    if (!profile) {
      setInfo("Nessun profilo caricato. Riprova ad effettuare il login.");
      return;
    }

    // applichiamo subito il tema lato client
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("quantivo-theme", theme);

    const { error } = await supabase
      .from("profiles")
      .update({
        risk_level: risk,
        markets,
        sectors,
        ai_style: aiStyle,
        theme, // NB: assicurati che esista la colonna "theme" o rimuovi questa riga
      })
      .eq("id", profile.id);

    if (error) {
      console.error("Errore salvataggio preferenze:", error);
      setInfo("Errore: " + error.message);
      return;
    }

    setInfo("Preferenze salvate ✅");
  }

  return (
    <section className="flex flex-1 items-start justify-center py-4 md:py-8">
      <div className="glass w-full max-w-xl rounded-3xl p-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Preferenze Quantivo</h1>
          <p className="mt-1 text-xs text-slate-400">
            Adatta il profilo di rischio, i mercati di riferimento, lo stile
            dell&apos;AI e il tema dell&apos;interfaccia.
          </p>
        </div>

        <div className="grid gap-4 text-sm">
          <div>
            <label className="text-xs text-slate-400">Profilo di rischio</label>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="basso">Rischio basso</option>
              <option value="medio">Rischio medio</option>
              <option value="alto">Rischio alto</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Usato per modulare quanto aggressivi sono i suggerimenti AI.
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400">
              Mercati di interesse
            </label>
            <input
              value={markets}
              onChange={(e) => setMarkets(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Es. USA, EU, EM"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Elenco separato da virgole. Verrà usato nei prompt AI.
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400">Settori preferiti</label>
            <input
              value={sectors}
              onChange={(e) => setSectors(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Es. Tech, Healthcare, Energy"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Stile dell&apos;AI</label>
            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="educativo">Educativo</option>
              <option value="tecnico">Tecnico</option>
              <option value="principiante">Per principianti</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">
              Tema dell&apos;interfaccia
            </label>
            <div className="mt-2 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 rounded-2xl border px-3 py-2 ${
                  theme === "dark"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                🌙 Scuro (consigliato)
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 rounded-2xl border px-3 py-2 ${
                  theme === "light"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                ☀️ Chiaro
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Salva preferenze
        </button>

        {info && <p className="text-xs text-emerald-400">{info}</p>}
      </div>
    </section>
  );
}
