"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";

interface ReviewModalProps {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  riderId?: number | null;
  riderName?: string | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function ReviewModal({
  orderId,
  restaurantId,
  restaurantName,
  riderId,
  riderName,
  onClose,
  onSubmitSuccess,
}: ReviewModalProps) {
  const [foodRating, setFoodRating] = useState(5);
  const [riderRating, setRiderRating] = useState(5);
  const [comment, setComment] = useState("");
  const { submitReview, isSubmittingReview } = useOrder();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitReview({
        orderId,
        restaurantId,
        riderId: riderId ?? null,
        rating: foodRating,
        riderRating: riderId ? riderRating : null,
        comment,
      });
      onSubmitSuccess();
    } catch {
      // Error is caught & populated in hook error state
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 text-center">
          <h3 className="font-serif text-xl font-bold text-foreground">
            How was your order?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Order #CRV-{orderId} from{" "}
            <span className="font-semibold text-foreground">
              {restaurantName}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <StarPicker
            label={`Rate Food (${restaurantName})`}
            value={foodRating}
            onChange={setFoodRating}
          />

          {riderId && (
            <StarPicker
              label={`Rate Delivery (${riderName || "Rider"})`}
              value={riderRating}
              onChange={setRiderRating}
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Review details (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about food quality, packaging, or delivery speed..."
              className="w-full border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 border border-input bg-background py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-1/2 bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StarPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`size-6 ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
