"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Props = {
  children: React.ReactNode;
};

/**
 * Mostra il contenuto solo se l'utente è loggato.
 * Se NON è loggato → redirect a /account/login
 */
export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        // non loggato → manda al login
        router.replace("/account/login");
        setAllowed(false);
      } else {
        setAllowed(true);
      }
      setChecking(false);
    }

    checkSession();
  }, [router]);

  // piccolo loader mentre controlliamo / reindirizziamo
  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-sm text-slate-400 shadow-soft">
          Checking your session…
        </div>
      </div>
    );
  }

  if (!allowed) return null; // stiamo già reindirizzando

  return <>{children}</>;
}
