// app/ads/page.tsx
"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdFromDb = {
  id: string;
  title: string | null;
  company: string | null;
  description: string | null;
  link: string | null;
  image_urls: string[] | null;
  created_at?: string;
};

type DemoAd = {
  id: number;
  label: string;
  title: string;
  company: string;
  description: string;
  cta: string;
  url: string;
  imageUrl: string;
};

const DEMO_ADS: DemoAd[] = [
  {
    id: 1,
    label: "Sponsored ETF",
    title: "GreenFuture ESG Fund",
    company: "Nova Asset Management",
    description:
      "A globally diversified ESG-focused ETF tracking companies leading the transition toward renewable energy, clean mobility, and sustainable technologies.",
    cta: "View ETF factsheet",
    url: "https://example.com/greenfuture",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    label: "Partner",
    title: "FinEdu Academy – Investing 101",
    company: "FinEdu Academy",
    description:
      "A complete beginner-friendly course covering the fundamentals of modern investing, portfolio construction, and market psychology through short videos and real-world case studies.",
    cta: "Discover the courses",
    url: "https://example.com/finedu",
    imageUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function AdsPage() {
  // form state
  const [campaignTitle, setCampaignTitle] = useState("");
  const [company, setCompany] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  // ui state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ads from Supabase
  const [ads, setAds] = useState<AdFromDb[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  // Carica gli ads esistenti da Supabase
  useEffect(() => {
    async function fetchAds() {
      setLoadingAds(true);
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ads", error);
      } else {
        setAds(data || []);
      }
      setLoadingAds(false);
    }

    fetchAds();
  }, []);

  // Upload immagini su Supabase Storage e ritorna gli URL pubblici
  async function uploadImages(files: FileList): Promise<string[]> {
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("ads-images") // nome bucket
        .upload(fileName, file);

      if (error || !data) {
        console.error(error);
        throw new Error("Error uploading creatives");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("ads-images").getPublicUrl(data.path);

      urls.push(publicUrl);
    }

    return urls;
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // prendo l'utente loggato (se c'è)
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error(sessionError);
        throw new Error("Unable to read session");
      }
      const sessionUser = sessionData.session?.user;

      // 1) upload creatives se presenti
      let imageUrls: string[] | null = null;
      if (files && files.length > 0) {
        imageUrls = await uploadImages(files);
      }

      // 2) salvo la richiesta di sponsorizzazione su Supabase (tabella "ads")
      const { data, error } = await supabase
        .from("ads")
        .insert({
          user_id: sessionUser?.id ?? null,
          title: campaignTitle,
          company,
          link,
          description,
          image_urls: imageUrls,
        })
        .select()
        .single();

      if (error || !data) {
        console.error(error);
        throw new Error("Error while saving the sponsorship request");
      }

      // 3) chiamo l'API che crea la Checkout Session su Stripe
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: data.id }),
      });

      if (!res.ok) {
        console.error(await res.text());
        throw new Error("Error while starting payment");
      }

      const { url } = await res.json();
      if (!url) {
        throw new Error("No Stripe URL returned");
      }

      // 4) redirect alla pagina di pagamento di Stripe
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Something went wrong while creating your sponsorship. Please try again or contact support."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6 py-4">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Sponsored section</h1>
          <p className="text-sm text-slate-400">
            See current sponsors featured inside Quantivo and create your own
            campaigns with custom creatives and secure payments.
          </p>
        </header>

        {/* Sponsored ads list */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Featured sponsors
          </h2>

          {loadingAds ? (
            <p className="text-sm text-slate-400">Loading ads…</p>
          ) : ads.length === 0 ? (
            // fallback: 2 ads “veri” statici con immagini
            <div className="grid gap-3 md:grid-cols-2">
              {DEMO_ADS.map((ad) => (
                <article
                  key={ad.id}
                  className="
                    rounded-3xl border border-[var(--card-border)] 
                    bg-[var(--card-bg)] p-4 shadow-soft 
                    flex flex-col gap-3
                  "
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-40 w-full rounded-2xl object-cover"
                  />

                  <div className="space-y-1">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                      {ad.label}
                    </span>
                    <h3 className="text-base font-semibold">{ad.title}</h3>
                    <p className="text-xs text-slate-400">{ad.company}</p>
                    <p className="text-sm text-slate-400">{ad.description}</p>
                  </div>

                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noreferrer"
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
          ) : (
            // ads reali da Supabase
            <div className="grid gap-3 md:grid-cols-2">
              {ads.map((ad) => (
                <article
                  key={ad.id}
                  className="
                    rounded-3xl border border-[var(--card-border)] 
                    bg-[var(--card-bg)] p-4 shadow-soft 
                    flex flex-col gap-3
                  "
                >
                  {ad.image_urls && ad.image_urls.length > 0 && (
                    <img
                      src={ad.image_urls[0]}
                      alt={ad.title || ad.company || "Sponsored image"}
                      className="h-40 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="space-y-1">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                      Sponsored
                    </span>
                    <h3 className="text-base font-semibold">
                      {ad.title || ad.company}
                    </h3>
                    {ad.company && (
                      <p className="text-xs text-slate-400">{ad.company}</p>
                    )}
                    {ad.description && (
                      <p className="text-sm text-slate-400">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  {ad.link && (
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex w-full items-center justify-center rounded-2xl 
                        bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-slate-950
                        transition hover:bg-emerald-400
                      "
                    >
                      Visit website
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Form to create an ad */}
        <section className="space-y-4 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-soft">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              Promote your project on Quantivo
            </h2>
            <p className="text-sm text-slate-400">
              Upload your creatives, add company details and proceed to secure
              payment with Stripe Checkout.
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

            {/* prezzo fisso, non modificabile dal client */}
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs text-slate-400">Sponsorship price</label>
              <p className="text-sm font-medium text-slate-100">
                €15 per sponsored slot
              </p>
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
                placeholder="Describe your product, audience and goals…"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-400">Creatives (images)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                className="input py-2"
              />
              <p className="text-[10px] text-slate-500">
                Upload one or more images that will be displayed inside Quantivo.
                Supported formats: JPG, PNG, WEBP.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex w-full items-center justify-center rounded-2xl 
                  bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950
                  transition hover:bg-emerald-400 disabled:opacity-50
                "
              >
                {submitting ? "Redirecting to payment…" : "Submit & pay"}
              </button>

              {errorMsg && (
                <p className="text-xs text-red-400">{errorMsg}</p>
              )}

              <p className="text-[10px] text-slate-500">
                Ads are stored in Supabase and images are hosted in the
                <code className="mx-1">ads-images</code> storage bucket.
                Payments are processed securely via Stripe (test mode).
              </p>
            </div>
          </form>
        </section>
      </div>
    </AuthGuard>
  );
}
