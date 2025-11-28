// app/account/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password.trim()) {
      setError("Inserisci una email e una password valide.");
      return;
    }

    setLoading(true);

    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        emailRedirectTo: "http://localhost:3000/account/verify",
      },
    });

    if (signError) {
      console.error(signError);
      setError(signError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
        name,
        surname,
        job,
        email,
      });
    }

    setLoading(false);
    setInfo(
      "Registrazione completata! Ti abbiamo inviato una email di conferma. Controlla la posta e clicca il link per attivare l'account."
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center py-6">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-sky-500/40 via-emerald-500/20 to-transparent blur-2xl" />
        <div className="glass rounded-3xl p-6">
          <h1 className="text-xl font-semibold">Crea un account Quantivo</h1>
          <p className="mt-1 text-xs text-slate-400">
            Personalizza il profilo di rischio, i mercati e lo stile della tua
            AI finanziaria.
          </p>

          <form onSubmit={handleSignUp} className="mt-4 space-y-3">
            <input
              required
              className="input text-sm"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              className="input text-sm"
              placeholder="Cognome"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            <input
              required
              className="input text-sm"
              placeholder="Professione"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />
            <input
              required
              type="email"
              className="input text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              type="password"
              className="input text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-xs text-rose-400">{error}</p>}
            {info && <p className="text-xs text-emerald-400">{info}</p>}

            <button
              disabled={loading}
              className="btn-primary mt-1 w-full rounded-2xl py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registrazione..." : "Registrati"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Hai già un account?{" "}
            <a href="/account/login" className="text-emerald-300 hover:text-emerald-200">
              Accedi
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
