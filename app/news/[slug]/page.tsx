// app/news/[slug]/page.tsx
import { fetchAiNews } from "@/lib/news";

type PageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = params;

  // 🧪 DEBUG: ricarico tutte le news
  const articles = await fetchAiNews();

  // log lato server (vedi in npm run dev o nei log Vercel)
  console.log("NEWS DETAIL slug:", slug);
  console.log(
    "NEWS DETAIL available slugs:",
    articles.map((a) => a.slug)
  );

  const article = articles.find((a) => a.slug === slug) ?? null;

  // 🧪 DEBUG VISIVO
  const debugInfo = {
    slugParam: slug,
    articlesCount: articles.length,
    firstSlugs: articles.slice(0, 5).map((a) => a.slug),
    found: !!article,
  };

  if (!article) {
    return (
      <div className="space-y-6 py-4">
        <section className="rounded-3xl border border-red-500/40 bg-red-500/5 p-4 text-xs text-red-200 space-y-2">
          <p className="font-semibold">DEBUG – article not found</p>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </section>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Article not found</h1>
          <p className="text-sm text-slate-400">
            This article is no longer available. Please go back to the news
            list.
          </p>
        </header>
      </div>
    );
  }

  const {
    title,
    description,
    imageUrl,
    publishedAt,
    url,
    sourceName,
    content,
  } = article;

  const mainText =
    (content && content.trim()) ||
    description ||
    "Full content is not available from the provider. Open the full article on the original website.";

  return (
    <div className="space-y-6 py-4">
      {/* DEBUG BOX */}
      <section className="rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-xs text-emerald-200 space-y-2">
        <p className="font-semibold">DEBUG – match</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </section>

      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {sourceName && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              {sourceName}
            </span>
          )}
          {publishedAt && (
            <span>
              {new Date(publishedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold">{title}</h1>

        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </header>

      {/* Immagine */}
      {imageUrl && (
        <div className="overflow-hidden rounded-3xl border border-[var(--card-border)]">
          <img
            src={imageUrl}
            alt={title}
            className="h-72 w-full object-cover"
          />
        </div>
      )}

      {/* Contenuto + CTA */}
      <section className="space-y-4 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-soft">
        <p className="text-sm text-slate-200 whitespace-pre-line">
          {mainText}
        </p>

        <p className="text-xs text-slate-500">
          This is a preview. The full article is hosted on an external news
          website. To read all details, open the original source.
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex w-full items-center justify-center rounded-2xl 
              bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950
              transition hover:bg-emerald-400
            "
          >
            Read full article on {sourceName || "source"}
          </a>
        )}
      </section>
    </div>
  );
}
