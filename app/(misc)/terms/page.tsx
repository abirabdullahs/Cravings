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
            By accessing or using Cravings Delivery services in Dhaka,
            Bangladesh, you agree to be bound by these Terms of Service. If you
            do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            2. Ordering & Placement
          </h2>
          <p className="text-muted-foreground">
            All orders placed are subject to availability and restaurant
            acceptance. Once confirmed, orders cannot be modified. Cancellation
            is only permitted prior to restaurant acceptance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            3. Pricing & Payment
          </h2>
          <p className="text-muted-foreground">
            Prices displayed include applicable local taxes unless stated
            otherwise. Delivery fees are non-refundable once a rider has been
            dispatched to pick up your items.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            4. User Obligations
          </h2>
          <p className="text-muted-foreground">
            Customers must provide accurate contact numbers and delivery
            addresses. Failure to meet the rider at the drop-off location within
            10 minutes of arrival may result in order forfeiture without refund.
          </p>
        </section>
      </div>
    </div>
  );
}
