// app/account/reset/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(true);
  const [sessionOk, setSessionOk] = useState(false);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // quando arrivi dal link di reset, Supabase crea una sessione temporanea
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setSessionOk(true);
      } else {
        setSessionOk(false);
      }
      setLoading(false);
    }
    checkSession();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!password || password.length < 6) {
      setError("La nuova password deve avere almeno 6 caratteri.");
      return;
    }
    if (password !== password2) {
      setError("Le password non coincidono.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setInfo("Password aggiornata correttamente. Ora puoi effettuare il login.");
  }

  if (loading) return <p className="p-6">Verifica del link in corso…</p>;

  if (!sessionOk)
    return (
      <div className="p-6 max-w-md mx-auto space-y-2">
        <h1 className="text-lg font-semibold">Link non valido o scaduto</h1>
        <p className="text-sm text-slate-400">
          Richiedi un nuovo link di reset dalla pagina di login.
        </p>
        <a href="/account/login" className="text-sky-400 text-sm">
          Torna al login
        </a>
      </div>
    );

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Imposta una nuova password</h1>

      <form onSubmit={handleChangePassword} className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Nuova password</label>
          <input
            type="password"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Ripeti nuova password
          </label>
          <input
            type="password"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm disabled:bg-slate-700"
        >
          {saving ? "Salvataggio…" : "Aggiorna password"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {info && (
        <p className="text-emerald-400 text-sm">
          {info}{" "}
          <a href="/account/login" className="text-sky-400 underline">
            Vai al login
          </a>
        </p>
      )}
    </div>
  );
}
