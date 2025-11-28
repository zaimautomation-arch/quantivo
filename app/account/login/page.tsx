// app/account/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState("");
  const [resetError, setResetError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password.trim()) {
      setError("Inserisci email e password.");
      return;
    }

    setLoading(true);

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (signError) {
      console.error(signError);
      setError(signError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setInfo("Login effettuato ✅");
      window.location.href = "/account";
    }

    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetInfo("");

    if (!resetEmail.trim()) {
      setResetError("Inserisci l'email con cui ti sei registrato.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim(),
      {
        redirectTo: "http://localhost:3000/account/reset",
      }
    );

    if (error) {
      console.error(error);
      setResetError(error.message);
    } else {
      setResetInfo(
        "Se l'email è presente nei nostri sistemi, ti abbiamo inviato un link per reimpostare la password."
      );
    }

    setResetLoading(false);
  }

  return (
    <section className="flex flex-1 items-center justify-center py-6">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/40 via-sky-500/20 to-transparent blur-2xl" />
        <div className="glass rounded-3xl p-6">
          <div className="mb-5">
            <h1 className="text-xl font-semibold">Accedi a Quantivo</h1>
            <p className="mt-1 text-xs text-slate-400">
              Entra per vedere le tue preferenze AI, la cronologia chat e le
              idee personalizzate.
            </p>
          </div>

          {/* login */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@esempio.com"
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="text-xs text-slate-400">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}
            {info && <p className="text-xs text-emerald-400">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1 w-full rounded-2xl py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          {/* reset */}
          <div className="mt-5 border-t border-slate-800/70 pt-4 text-xs">
            <p className="text-slate-400">Hai dimenticato la password?</p>
            <form
              onSubmit={handleResetPassword}
              className="mt-2 space-y-2 text-left"
            >
              <input
                type="email"
                placeholder="Inserisci la tua email"
                className="input text-sm"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetLoading ? "Invio in corso..." : "Invia email di reset"}
              </button>

              {resetError && (
                <p className="text-[11px] text-rose-400">{resetError}</p>
              )}
              {resetInfo && (
                <p className="text-[11px] text-emerald-400">{resetInfo}</p>
              )}
            </form>
          </div>

          {/* link signup */}
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Non hai un account?{" "}
            <a href="/account/signup" className="text-emerald-300 hover:text-emerald-200">
              Registrati
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
