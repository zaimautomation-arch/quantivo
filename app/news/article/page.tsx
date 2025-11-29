// app/news/article/page.tsx

// Pagina dinamica: ogni richiesta vede i suoi searchParams
export const dynamic = "force-dynamic";

type RawSearchParams = {
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams?: RawSearchParams;
};

// helper per gestire string | string[]
function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function NewsArticlePage({ searchParams }: PageProps) {
  const params = searchParams ?? {};

  // 🧪 DEBUG lato server (vedi nei log Vercel o in npm run dev)
  console.log("NEWS ARTICLE searchParams:", params);

  const title = getParam(params.title);
  const description = getParam(params.description);
  const imageUrl = getParam(params.imageUrl);
  const publishedAt = getParam(params.publishedAt);
  const url = getParam(params.url);
  const sourceName = getParam(params.sourceName);
  const content = getParam(params.content);

  const mainText =
    (content && content.trim()) ||
    description ||
    "Full content is not available from the provider. Open the full article on the original website.";

  return (
    <div className="space-y-6 py-4">
      {/* 🧪 DEBUG VISIVO */}
      <section className="rounded-3xl border border-red-500/40 bg-red-500/5 p-4 text-xs text-red-200 space-y-2">
        <p className="font-semibold">DEBUG – searchParams</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(params, null, 2)}
        </pre>

        <p className="font-semibold pt-2">DEBUG – parsed values</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>title:</strong> {title ?? "<undefined>"}
          </li>
          <li>
            <strong>description:</strong>{" "}
            {description ? description.slice(0, 120) + "…" : "<undefined>"}
          </li>
          <li>
            <strong>imageUrl:</strong> {imageUrl ?? "<undefined>"}
          </li>
          <li>
            <strong>publishedAt:</strong> {publishedAt ?? "<undefined>"}
          </li>
          <li>
            <strong>url:</strong> {url ?? "<undefined>"}
          </li>
          <li>
            <strong>sourceName:</strong> {sourceName ?? "<undefined>"}
          </li>
          <li>
            <strong>content:</strong>{" "}
            {content ? content.slice(0, 120) + "…" : "<undefined>"}
          </li>
        </ul>
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

      {/* Immagine principale */}
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
