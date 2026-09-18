import { MapPin } from "lucide-react";

const areas = [
  "Gulshan 1 & 2",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Mirpur",
  "Baily Road",
  "Old Dhaka (Nazira Bazar)",
  "Bashundhara R/A",
];

export default function DeliveryAreasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold">Delivery Coverage</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We currently serve major culinary hotspots across Dhaka city.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {areas.map((area) => (
          <div
            key={area}
            className="flex items-center gap-2 border border-border p-4 text-xs font-semibold"
          >
            <MapPin className="size-4 text-primary shrink-0" />
            <span>{area}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
