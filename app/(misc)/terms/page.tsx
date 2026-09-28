export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-bold">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: September 18, 2026
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-foreground/90">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="text-muted-foreground">
            Cravings is an academic demonstration, not a commercial delivery
            service. Demo data and simulated payment options must not be treated
            as real purchases or financial transactions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            2. Ordering & Placement
          </h2>
          <p className="text-muted-foreground">
            All orders placed are subject to availability and restaurant
            opening hours. Customer cancellation is not implemented in the
            bounded demo workflow.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            3. Pricing & Payment
          </h2>
          <p className="text-muted-foreground">
            Prices, tax, discounts, and delivery fees are calculated by the
            server. Digital payments and automatic refunds are simulated or out
            of scope.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            4. User Obligations
          </h2>
          <p className="text-muted-foreground">
            Customers must provide accurate contact numbers and delivery
            addresses so the academic delivery workflow can be demonstrated.
          </p>
        </section>
      </div>
    </div>
  );
}
