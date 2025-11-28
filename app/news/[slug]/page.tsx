// app/news/[slug]/page.tsx
import { fetchAiNews } from "@/lib/news";

type Props = {
  params: { slug: string };
};

// tipo Article derivato da fetchAiNews
type Article = Awaited<ReturnType<typeof fetchAiNews>>[number];

// rimuove la parte tipo " [+123 chars]"
function cleanContent(content: string): string {
  return content.replace(/\s*\[\+\d+\schars\]$/, "").trim();
}

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = params;

  let articles: Article[] = [];

  try {
    // SSR normale, caching gestito da fetchAiNews (revalidate interno)
    articles = await fetchAiNews();
  } catch (error) {
    console.error("Error fetching news in detail page:", error);
  }

  const article = articles.find((a) => a.slug === slug);

  // Se proprio non troviamo l'articolo, mostriamo una pagina di fallback
  if (!article) {
    return (
      <div className="space-y-6 py-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Article not available</h1>
          <p className="text-sm text-slate-400">
            We couldn&apos;t load this article right now. The news provider may
            be temporarily unavailable or the link is no longer valid.
          </p>
        </header>

        <a
          href="/news"
          className="
            inline-flex w-full items-center justify-center rounded-2xl 
            bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950
            transition hover:bg-emerald-400
          "
        >
          Back to all news
        </a>
      </div>
    );
  }

  const mainText =
    article.content?.trim()
      ? cleanContent(article.content)
      : article.description ||
        "Full content is not available from the news provider. You can read the complete article on the original website.";

  const externalUrl = article.url || "#";

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            {article.sourceName}
          </span>
          {article.publishedAt && (
            <span>
              {new Date(article.publishedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold">{article.title}</h1>

        {article.description && (
          <p className="text-sm text-slate-400">{article.description}</p>
        )}
      </header>

      {/* Immagine principale */}
      {article.imageUrl && (
        <div className="overflow-hidden rounded-3xl border border-[var(--card-border)]">
          <img
            src={article.imageUrl}
            alt={article.title}
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
          The full article is hosted on an external news website. Quantivo
          displays a short excerpt; to read all the details please open the
          original source.
        </p>

        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex w-full items-center justify-center rounded-2xl 
            bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950
            transition hover:bg-emerald-400
          "
        >
          Read full article on {article.sourceName}
        </a>
      </section>
    </div>
  );
}
