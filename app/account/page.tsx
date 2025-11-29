// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  risk_level: string | null;
  markets: string | null;
  sectors: string | null;
  ai_style: string | null;
  avatar_url: string | null;
};

type Theme = "light" | "dark";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");

  // preference state
  const [risk, setRisk] = useState("medium");
  const [markets, setMarkets] = useState("USA,EU");
  const [sectors, setSectors] = useState("Tech,Healthcare");
  const [aiStyle, setAiStyle] = useState("educational");

  const [saving, setSaving] = useState(false);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);

  // avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  // load session + profile + theme
  useEffect(() => {
    async function load() {
      // theme from localStorage
      if (typeof window !== "undefined") {
        const stored = (localStorage.getItem("quantivo-theme") ||
          "dark") as Theme;
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      }

      // session
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;

      if (!sessionUser) {
        setLoading(false);
        setUser(null);
        return;
      }

      // profile
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        const fallbackProfile: Profile = {
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          risk_level: null,
          markets: null,
          sectors: null,
          ai_style: null,
          avatar_url: null,
        };
        setUser(fallbackProfile);
        setAvatarUrl(null);
      } else if (prof) {
        const profile: Profile = {
          id: prof.id,
          email: prof.email ?? sessionUser.email ?? null,
          risk_level: prof.risk_level,
          markets: prof.markets,
          sectors: prof.sectors,
          ai_style: prof.ai_style,
          avatar_url: prof.avatar_url ?? null,
        };
        setUser(profile);

        // init preference state from profile
        if (profile.risk_level) setRisk(profile.risk_level);
        if (profile.markets) setMarkets(profile.markets);
        if (profile.sectors) setSectors(profile.sectors);
        if (profile.ai_style) setAiStyle(profile.ai_style);
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      }

      setLoading(false);
    }

    load();
  }, []);

  // save preferences immediately on change
  async function updatePreferences(update: Partial<Profile>) {
    if (!user) return;
    setSaving(true);
    setSaveInfo(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        risk_level: update.risk_level ?? risk,
        markets: update.markets ?? markets,
        sectors: update.sectors ?? sectors,
        ai_style: update.ai_style ?? aiStyle,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving preferences:", error);
      setSaveInfo("Error while saving. Please try again.");
    } else {
      setSaveInfo("Preferences saved ✅");
    }

    setSaving(false);
  }

  // upload avatar image
  async function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        setAvatarMessage("You must be logged in to upload an image.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${authUser.id}/${fileName}`;

      // upload nel bucket "avatars"
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setAvatarMessage("Error uploading image.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // aggiorna il profilo con il nuovo URL
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", authUser.id);

      if (profileError) {
        console.error(profileError);
        setAvatarMessage("Image uploaded, but failed to save profile.");
        return;
      }

      setAvatarUrl(publicUrl);
      setAvatarMessage("Profile picture updated ✔");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function changeTheme(next: Theme) {
    setTheme(next);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("quantivo-theme", next);
    }
  }

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading…</p>;
  }

  // NOT LOGGED IN
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-center shadow-soft">
          <h1 className="text-lg font-semibold">Quantivo account</h1>
          <p className="mt-2 text-sm text-slate-400">
            To manage AI preferences, theme and history, please log in or
            create a new account.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <a
              href="/account/login"
              className="btn-primary w-full rounded-2xl text-sm"
            >
              Log in
            </a>
            <a
              href="/account/signup"
              className="btn-ghost w-full rounded-2xl text-sm"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN
  return (
    <div className="flex min-h-[60vh] justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-soft md:p-7">
        {/* Account header */}
        <section className="space-y-1">
          <h1 className="text-xl font-semibold md:text-2xl">
            Your Quantivo account
          </h1>
          <p className="text-sm text-slate-400">
            Manage your profile, AI preferences and interface theme.
          </p>
        </section>

        {/* Basic user info */}
        <section className="space-y-3 rounded-2xl bg-[rgba(148,163,184,0.06)] p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Profile
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-slate-400">Email</div>
            <div className="font-medium text-[color:var(--foreground)]">
              {user.email ?? "—"}
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-slate-400">Account status</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
        </section>

        {/* Avatar upload */}
        <section className="space-y-3 rounded-2xl bg-[rgba(148,163,184,0.04)] p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Profile picture
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-600 bg-slate-900/40">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-300">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <label className="font-medium text-slate-300">
                Upload a new profile picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="text-[11px] text-slate-200"
              />
              <span className="text-[10px] text-slate-500">
                Recommended: square image, at least 256×256 px.
              </span>
              {avatarMessage && (
                <span className="text-[11px] text-emerald-400">
                  {avatarMessage}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Preferences + theme */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              AI preferences
            </h2>
            {saving && (
              <span className="text-[11px] text-slate-400">Saving…</span>
            )}
            {!saving && saveInfo && (
              <span className="text-[11px] text-emerald-500">{saveInfo}</span>
            )}
          </div>

          <div className="grid gap-4 text-sm md:grid-cols-2">
            {/* Risk profile – valori in italiano per compatibilità DB */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">
                Risk profile 
              </label>
              <select
                value={risk}
                onChange={(e) => {
                  const v = e.target.value;
                  setRisk(v);
                  updatePreferences({ risk_level: v });
                }}
                className="input"
              >
                <option value="basso">Low risk</option>
                <option value="medio">Medium risk</option>
                <option value="alto">High risk</option>
              </select>
            </div>

            {/* AI style – valori ancora in italiano */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">AI style</label>
              <select
                value={aiStyle}
                onChange={(e) => {
                  const v = e.target.value;
                  setAiStyle(v);
                  updatePreferences({ ai_style: v });
                }}
                className="input"
              >
                <option value="educativo">Educational</option>
                <option value="tecnico">Technical</option>
                <option value="principiante">For beginners</option>
              </select>
            </div>

            {/* Markets */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">
                Markets of interest
              </label>
              <input
                value={markets}
                onChange={(e) => {
                  const v = e.target.value;
                  setMarkets(v);
                  updatePreferences({ markets: v });
                }}
                className="input"
                placeholder="e.g. USA, EU, Emerging..."
              />
            </div>

            {/* Sectors */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">
                Preferred sectors
              </label>
              <input
                value={sectors}
                onChange={(e) => {
                  const v = e.target.value;
                  setSectors(v);
                  updatePreferences({ sectors: v });
                }}
                className="input"
                placeholder="e.g. Tech, Healthcare..."
              />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Interface theme
          </h2>
          <p className="text-xs text-slate-400">
            Choose whether you prefer Quantivo in light or dark mode.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => changeTheme("dark")}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                theme === "dark"
                  ? "bg-slate-900 text-slate-50 shadow-soft"
                  : "border border-slate-400/60 bg-transparent text-slate-600"
              }`}
            >
              🌙 Dark theme
            </button>

            <button
              type="button"
              onClick={() => changeTheme("light")}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                theme === "light"
                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-400"
                  : "border border-emerald-300/70 bg-transparent text-emerald-600"
              }`}
            >
              ☀️ Light theme
            </button>
          </div>
        </section>

        {/* Logout at bottom */}
        <section className="pt-4">
          <button
            type="button"
            className="w-full rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
