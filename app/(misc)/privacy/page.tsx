export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: September 18, 2026
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-foreground/90">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            1. Data We Collect
          </h2>
          <p className="text-muted-foreground">
            We collect personal information necessary to deliver food orders,
            including your name, phone number, email address, precise
            geolocation data, and order history.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            2. How We Use Your Data
          </h2>
          <p className="text-muted-foreground">
            Your location and phone number are shared strictly with assigned
            riders and restaurant partners to complete your delivery. We never
            sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            3. Payment Security
          </h2>
          <p className="text-muted-foreground">
            All electronic payment details are securely processed via encrypted
            PCI-DSS compliant payment gateways (bKash, Nagad, SSLCommerz).
            Cravings does not store raw credit card credentials on its servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            4. Contact Us
          </h2>
          <p className="text-muted-foreground">
            For data deletion or privacy concerns, contact our privacy
            compliance team at privacy@cravings.com.bd.
          </p>
        </section>
      </div>
    </div>
  );
}
