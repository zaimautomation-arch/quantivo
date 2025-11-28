"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";

type DemoAd = {
  id: number;
  label: string;
  title: string;
  description: string;
  cta: string;
  url: string;
};

const DEMO_ADS: DemoAd[] = [
  {
    id: 1,
    label: "Sponsored ETF",
    title: "GreenFuture ESG Fund",
    description:
      "An ESG-focused ETF tracking global companies committed to the energy transition.",
    cta: "View ETF factsheet",
    url: "#",
  },
  {
    id: 2,
    label: "Partner",
    title: "FinEdu Academy",
    description:
      "Online courses to learn the basics of investing and portfolio construction.",
    cta: "Discover the courses",
    url: "#",
  },
  {
    id: 3,
    label: "Tool",
    title: "TaxOptimizer Pro",
    description:
      "A tool that helps you track gains and losses for tax purposes in multiple markets.",
    cta: "Learn more",
    url: "#",
  },
];

export default function AdsPage() {
  const [campaignTitle, setCampaignTitle] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // Per adesso NON usiamo ancora i dati del form, li useremo quando colleghiamo Supabase
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok || !json.url) {
        throw new Error(json.error || "Errore nel creare la sessione di pagamento");
      }

      // Redirect alla pagina di pagamento Stripe
      window.location.href = json.url;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Qualcosa è andato storto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6 py-4">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Sponsored section</h1>
          <p className="text-sm text-slate-400">
            Discover partners and sponsors featured inside Quantivo, and
            promote your own financial products or services to active investors.
          </p>
        </header>

        {/* Sponsored ads list (demo) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Featured sponsors
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {DEMO_ADS.map((ad) => (
              <article
                key={ad.id}
                className="
                  rounded-3xl border border-[var(--card-border)] 
                  bg-[var(--card-bg)] p-4 shadow-soft 
                  flex flex-col justify-between gap-3
                "
              >
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                    {ad.label}
                  </span>
                  <h3 className="text-base font-semibold">{ad.title}</h3>
                  <p className="text-sm text-slate-400">{ad.description}</p>
                </div>
                <a
                  href={ad.url}
                  className="
                    inline-flex w-full items-center justify-center rounded-2xl 
                    bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-slate-950
                    transition hover:bg-emerald-400
                  "
                >
                  {ad.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Form to buy/request an ad */}
        <section className="space-y-4 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-soft">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              Promote your project on Quantivo
            </h2>
            <p className="text-sm text-slate-400">
              Fill in the form and proceed to secure payment with Stripe
              Checkout. For now this is a test flow running in sandbox mode.
            </p>
          </div>

          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleRequest}>
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs text-slate-400">Campaign title</label>
              <input
                className="input"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="Your campaign name"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-xs text-slate-400">Company / brand</label>
              <input
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-xs text-slate-400">
                Estimated monthly budget (EUR/USD)
              </label>
              <input
                className="input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-xs text-slate-400">
                Landing page / website URL
              </label>
              <input
                className="input"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://your-site.com"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-400">
                Short description of your ad
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product, target audience and goals…"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex w-full items-center justify-center rounded-2xl 
                  bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950
                  transition hover:bg-emerald-400 disabled:opacity-60
                "
              >
                {loading ? "Redirecting to payment…" : "Proceed to payment"}
              </button>

              {errorMsg && (
                <p className="text-xs text-red-400">{errorMsg}</p>
              )}

              <p className="text-[10px] text-slate-500">
                Payments are processed securely via Stripe in test mode. Card
                details never touch Quantivo servers.
              </p>
            </div>
          </form>
        </section>
      </div>
    </AuthGuard>
  );
}
