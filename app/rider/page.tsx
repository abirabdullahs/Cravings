export default async function RiderDashboard() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
			<div className="mb-8 border-b border-border pb-7">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
					Rider dashboard
				</p>
				<h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Ready for your next delivery.
				</h1>
				<p className="mt-2 max-w-xl text-sm text-muted-foreground">
					Delivery requests and active orders will appear here when they are assigned to you.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="border border-border bg-card p-5">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						Available requests
					</p>
					<p className="mt-2 text-2xl font-bold text-foreground">0</p>
				</div>
				<div className="border border-border bg-card p-5">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						Active deliveries
					</p>
					<p className="mt-2 text-2xl font-bold text-foreground">0</p>
				</div>
				<div className="border border-border bg-card p-5">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						Today&apos;s earnings
					</p>
					<p className="mt-2 text-2xl font-bold text-foreground">৳0</p>
				</div>
			</div>

			<section className="mt-8 border border-dashed border-border p-10 text-center">
				<h2 className="font-serif text-2xl font-bold text-foreground">
					No delivery requests yet
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Stay available and new requests will show up here.
				</p>
			</section>
		</div>
	);
}
