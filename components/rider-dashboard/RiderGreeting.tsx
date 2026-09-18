interface RiderGreetingProps {
  firstName: string;
  dutyStatus: "online" | "offline";
  busy: boolean;
  onToggle: (next: "online" | "offline") => void;
}

export function RiderGreeting({
  firstName,
  dutyStatus,
  busy,
  onToggle,
}: RiderGreetingProps) {
  const isOnline = dutyStatus === "online";

  return (
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground">
          As-salamu alaykum, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Hope you have a safe and rewarding shift on the roads of Dhaka today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          Duty Status:
        </span>
        <div className="flex rounded-full border border-border bg-card p-1">
          <button
            disabled={busy}
            onClick={() => onToggle("online")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              isOnline
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Online
          </button>
          <button
            disabled={busy}
            onClick={() => onToggle("offline")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              !isOnline
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Offline
          </button>
        </div>
      </div>
    </div>
  );
}
