// components/admin/RoleRequestsTable.tsx
"use client";

export type RoleRequest = {
  id: number;
  requested_role: string;
  status: string;
  details: string | null;
  verification_data?: Record<string, unknown>;
  rejection_reason?: string | null;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string | null;
};

export function RoleRequestsTable({
  requests,
  onReview,
}: {
  requests: RoleRequest[];
  onReview: (id: number, status: "APPROVED" | "REJECTED") => void;
}) {
  if (!requests.length) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Role requests</h2>
        <span className="text-sm text-muted-foreground">
          {requests.length} active
        </span>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => {
          // Filter out null, undefined, or empty string verification fields
          const validVerificationEntries = request.verification_data
            ? Object.entries(request.verification_data).filter(([, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === "string" && value.trim() === "")
                  return false;
                return true;
              })
            : [];

          return (
            <article
              key={request.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              {/* Header Info & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-base">
                    {request.requester_name ?? "Applicant"} ·{" "}
                    <span className="capitalize text-primary">
                      {request.requested_role}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {request.requester_email} ·{" "}
                    {request.requester_phone || "No phone provided"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      request.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : request.status === "REJECTED"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {request.status}
                  </span>

                  {request.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onReview(request.id, "APPROVED")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReview(request.id, "REJECTED")}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white hover:bg-destructive/90 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Request Details */}
              {request.details && (
                <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {request.details}
                </div>
              )}

              {/* Verification Data Grid (Only renders non-empty fields) */}
              {validVerificationEntries.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {validVerificationEntries.map(([key, value]) => {
                    // Formats camelCase/snake_case keys to clean readable labels
                    const formattedKey = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/_/g, " ")
                      .trim();

                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {formattedKey}
                        </span>
                        <span className="block text-xs font-medium text-foreground mt-0.5 break-all">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rejection Note */}
              {request.rejection_reason && (
                <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <strong>Reason for rejection:</strong>{" "}
                  {request.rejection_reason}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
