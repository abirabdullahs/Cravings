import { SearchResults } from "@/components/search/search-results";


export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const city = "Dhaka";

  return (
    <div className="bg-background">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Search Results
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            {query ? (
              <>
                Results for &ldquo;{query}&rdquo; in {city}
              </>
            ) : (
              <>Our selection in {city}</>
            )}
          </h1>
          
        </div>
      </section>

      <SearchResults query={query} city={city} />
    </div>
  );
}
