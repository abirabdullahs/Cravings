type Props = {
  restaurants: number;
  riders: number;
  productSales: string | number;
  platformProfit: string | number;
  orders: number;
  completed: number;
  activeCustomers: number;
  averageOrder: string | number;
  cancellationRate: number;
};

const money = (value: string | number) =>
  `৳${Number(value || 0).toLocaleString()}`;

export function AdminStatsOverview(props: Props) {
  const metrics = [
    ["Restaurants", props.restaurants],
    ["Riders", props.riders],
    ["Product sales", money(props.productSales)],
    ["Platform profit", money(props.platformProfit)],
    ["Orders", props.orders],
    ["Completed", props.completed],
    ["Active customers", props.activeCustomers],
    ["Average order", money(props.averageOrder)],
    ["Cancellation rate", `${Number(props.cancellationRate || 0).toFixed(1)}%`],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(0, 4).map(([label, value]) => (
          <Metric
            key={String(label)}
            label={String(label)}
            value={String(value)}
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.slice(4).map(([label, value]) => (
          <Metric
            key={String(label)}
            label={String(label)}
            value={String(value)}
          />
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
