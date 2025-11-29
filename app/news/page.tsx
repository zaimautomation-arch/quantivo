// app/news/page.tsx
import { fetchAiNews } from "@/lib/news";
import Link from "next/link";

export const revalidate = 1800; // opzionale: aggiorna ogni 30 min

export default async function NewsPage() {
  const articles = await fetchAiNews();

  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">AI & Finance News</h1>
        <p className="text-sm text-slate-400">
          Curated headlines about how artificial intelligence is transforming
          finance: markets, trading, investing, fintech and asset management.
          Updated every 30 minutes.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400">
          No AI finance news available right now. Please try again later.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-soft overflow-hidden flex flex-col"
            >
              {article.imageUrl && (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    {article.sourceName}
                  </span>
                  {article.publishedAt && (
                    <span className="text-[11px] text-slate-500">
                      {new Date(article.publishedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-semibold line-clamp-2">
                  {article.title}
                </h2>

                {article.description && (
                  <p className="text-sm text-slate-400 line-clamp-3">
                    {article.description}
                  </p>
                )}

                <div className="mt-auto pt-2">
                  <Link
                    href={{
                      pathname: `/news/${encodeURIComponent(article.slug)}`,
                      query: {
                        title: article.title,
                        description: article.description || "",
                        imageUrl: article.imageUrl || "",
                        publishedAt: article.publishedAt || "",
                        url: article.url || "",
                        sourceName: article.sourceName || "",
                        content: article.content || "",
                      },
                    }}
                    className="
                      inline-flex w-full items-center justify-center rounded-2xl 
                      bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-slate-950
                      transition hover:bg-emerald-400
                    "
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
