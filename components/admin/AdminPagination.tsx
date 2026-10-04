export function AdminPagination({
  page,
  total,
  pageSize,
  onPage,
  disabled = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const first = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const last = Math.min(safePage * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        {first}–{last} of {total} · Page {safePage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || safePage <= 1}
          onClick={() => onPage(safePage - 1)}
          className="border border-border px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPage(safePage + 1)}
          className="border border-border px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
