function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-muted ${className}`} />;
}

function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <Pulse className="aspect-[16/9] w-full" />
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Pulse className="h-5 w-2/3" />
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-4/5" />
          <Pulse className="mt-3 h-4 w-16" />
        </div>
        <Pulse className="h-9 w-16 shrink-0 rounded-sm" />
      </div>
    </div>
  );
}

export function RestaurantDetailSkeleton() {
  return (
    <main
      className="bg-background"
      aria-busy="true"
      aria-label="Loading restaurant"
    >
      <section className="border-b border-border">
        <div className="mx-auto flex items-center gap-2 px-4 py-3 sm:px-14">
          <Pulse className="h-3 w-10" />
          <Pulse className="size-3" />
          <Pulse className="h-3 w-20" />
          <Pulse className="size-3" />
          <Pulse className="h-3 w-24" />
        </div>

        <div className="mx-auto grid max-w-6xl border-x border-t border-border bg-card lg:grid-cols-[1fr_1.02fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <Pulse className="h-6 w-20 rounded-sm" />
            <Pulse className="mt-4 h-12 w-3/4 sm:h-14" />
            <Pulse className="mt-3 h-3 w-52" />
            <div className="mt-5 max-w-lg space-y-2">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-11/12" />
              <Pulse className="h-4 w-3/5" />
            </div>
            <div className="mt-6 flex flex-wrap gap-5 border-t border-border pt-4">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-4 w-28" />
              <Pulse className="h-4 w-24" />
            </div>
            <Pulse className="mt-3 h-4 w-36" />
          </div>
          <Pulse className="min-h-[280px] w-full lg:min-h-[330px]" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-y border-border py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-hidden pb-1">
              {["w-16", "w-24", "w-28", "w-20"].map((width) => (
                <Pulse
                  key={width}
                  className={`h-10 shrink-0 rounded-sm ${width}`}
                />
              ))}
            </div>
            <Pulse className="h-10 shrink-0 sm:w-64" />
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Pulse className="h-8 w-28" />
            <div className="mt-3 border-b border-border" />
            <div className="grid gap-4 pt-5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <MenuCardSkeleton key={index} />
              ))}
            </div>
            <div className="mt-8 border-t border-border pt-5">
              <Pulse className="h-3 w-full max-w-xl" />
            </div>
          </div>

          <aside className="lg:sticky lg:top-[9.5rem] lg:self-start">
            <div className="border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Pulse className="size-4" />
                <Pulse className="h-6 w-28" />
              </div>
              <div className="space-y-4 p-5">
                {[1, 2, 3].map((line) => (
                  <div key={line} className="flex justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Pulse className="h-4 w-3/4" />
                      <Pulse className="h-3 w-20" />
                    </div>
                    <Pulse className="h-7 w-20" />
                  </div>
                ))}
                <div className="space-y-3 border-t border-border pt-4">
                  <Pulse className="h-3 w-full" />
                  <Pulse className="h-3 w-full" />
                  <Pulse className="h-4 w-full" />
                </div>
                <Pulse className="h-11 w-full rounded-sm" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section className="mx-auto max-w-6xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <Pulse className="h-8 w-48" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[1, 2].map((review) => (
            <div key={review} className="space-y-3 border border-border bg-card p-4">
              <div className="flex justify-between gap-3">
                <Pulse className="h-4 w-28" />
                <Pulse className="h-4 w-12" />
              </div>
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-20" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
