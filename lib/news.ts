// lib/news.ts

export type AiNewsArticle = {
  slug: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl?: string;
  sourceName: string;
  publishedAt: string;
};

// slug basato SOLO sul titolo, così è stabile
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function fetchAiNews(): Promise<AiNewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn("NEWS_API_KEY is missing");
    return [];
  }

  const url = new URL("https://newsapi.org/v2/everything");

  // AI + FINANZA
  url.searchParams.set(
    "q",
    [
      // macroeconomia
      '"economy" OR "economic growth" OR "inflation" OR "interest rates" OR "central bank" OR "ECB" OR "Federal Reserve" OR "GDP" OR "unemployment"',
      "OR",
      // mercati finanziari
      '"stock market" OR stocks OR equities OR bonds OR "treasury yields" OR commodities OR gold OR oil',
      "OR",
      // investing & trading
      '"investing" OR investors OR "portfolio" OR "asset management" OR trading OR markets',
      "OR",
      // finanza e bancario
      'finance OR financial OR fintech OR banking OR "wealth management" OR "investment bank"',
    ].join(" ")
  );

  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "20");

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 1800 }, // max 1 chiamata ogni 30 min, cache condivisa
  });

  if (!res.ok) {
    console.error("Failed to fetch AI finance news", await res.text());
    return [];
  }

  const json = await res.json();

  const articles: AiNewsArticle[] = (json.articles || []).map(
    (article: any) => ({
      slug: slugify(article.title || "ai-finance-news"),
      title: article.title ?? "Untitled",
      description: article.description ?? "",
      content: article.content ?? "",
      url: article.url,
      imageUrl: article.urlToImage ?? undefined,
      sourceName: article.source?.name ?? "Unknown source",
      publishedAt: article.publishedAt ?? "",
    })
  );

  return articles;
}

// 🔴 NUOVO: trova un singolo articolo a partire dallo slug
export async function fetchArticleBySlug(
  slug: string
): Promise<AiNewsArticle | null> {
  const articles = await fetchAiNews();

  const article = articles.find((a) => a.slug === slug);

  return article ?? null;
}
