// app/account/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type SimpleUser = {
  id: string;
  email?: string;
};

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SimpleUser | null>(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    checkSession();
  }, []);

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Verifica in corso…</p>
      </div>
    );

  if (!user)
    return (
      <section className="flex flex-1 items-center justify-center py-6">
        <div className="glass w-full max-w-md rounded-3xl p-6 space-y-2">
          <h1 className="text-lg font-semibold">Email verificata!</h1>
          <p className="text-sm text-slate-400">
            Ora puoi effettuare il login dalla pagina Account.
          </p>
          <a
            href="/account/login"
            className="mt-2 inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Vai al login
          </a>
        </div>
      </section>
    );

  return (
    <section className="flex flex-1 items-center justify-center py-6">
      <div className="glass w-full max-w-md rounded-3xl p-6 space-y-3">
        <h1 className="text-lg font-semibold">Account attivato 🎉</h1>
        <p className="text-sm text-slate-400">
          Benvenuto {user.email}! Ora completa le tue preferenze per ottenere
          suggerimenti AI più mirati.
        </p>
        <a
          href="/account/preferences"
          className="inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Imposta preferenze
        </a>
      </div>
    </section>
  );
}
