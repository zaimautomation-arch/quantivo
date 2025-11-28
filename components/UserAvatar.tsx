// components/UserAvatar.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("");

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const email = user.email ?? "";
    setInitials(email ? email[0].toUpperCase() : "U");

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (!error && data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  }

  useEffect(() => {
    loadProfile();

    // piccola cosa in più: se ricarichi l'avatar da Account,
    // puoi dispatchare questo evento per forzare il refresh.
    window.addEventListener("quantivo-avatar-updated", loadProfile);
    return () =>
      window.removeEventListener("quantivo-avatar-updated", loadProfile);
  }, []);

  return (
    <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-700 bg-slate-900/40">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-200">
          {initials}
        </div>
      )}
    </div>
  );
}
