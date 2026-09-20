import { FormEvent, useState } from "react";
import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { UploadButton } from "@/lib/uploadthing";
import type { RestaurantInput } from "@/types/restaurant";

interface RestaurantFormDialogProps {
  initialValue: RestaurantInput;
  isEditing: boolean;
  busy: boolean;
  onSubmit: (input: RestaurantInput) => Promise<void> | void;
  onClose: () => void;
}

export function RestaurantFormDialog({
  initialValue,
  isEditing,
  busy,
  onSubmit,
  onClose,
}: RestaurantFormDialogProps) {
  const [form, setForm] = useState<RestaurantInput>(initialValue);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof RestaurantInput>(
    key: K,
    value: RestaurantInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl border border-border bg-background p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {isEditing ? "Update branch" : "New branch"}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
              Restaurant details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close restaurant form"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField
            label="Restaurant name"
            name="name"
            required
            value={form.name ?? ""}
            onChange={(value) => update("name", value)}
          />
          <FormField
            label="Phone"
            name="phone"
            value={form.phone ?? ""}
            onChange={(value) => update("phone", value)}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email ?? ""}
            onChange={(value) => update("email", value)}
          />
          <FormField
            label="Address"
            name="address"
            required
            value={form.address ?? ""}
            onChange={(value) => update("address", value)}
          />
          <FormField
            label="Opening time"
            name="openingTime"
            type="time"
            value={form.openingTime ?? ""}
            onChange={(value) => update("openingTime", value)}
          />
          <FormField
            label="Closing time"
            name="closingTime"
            type="time"
            value={form.closingTime ?? ""}
            onChange={(value) => update("closingTime", value)}
          />
          <FormField
            label="Delivery fee"
            name="deliveryFee"
            type="number"
            value={form.deliveryFee ?? 0}
            onChange={(value) => update("deliveryFee", Number(value))}
          />
          <FormField
            label="Minimum order"
            name="minimumOrder"
            type="number"
            value={form.minimumOrder ?? 0}
            onChange={(value) => update("minimumOrder", Number(value))}
          />

          {/* Restaurant Banner Image Upload */}
          <div className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            <span>Restaurant Image / Banner</span>
            {form.imageUrl ? (
              <div className="flex items-center gap-3 rounded-sm border border-border bg-background p-2">
                <Image
                  src={form.imageUrl}
                  alt="Restaurant image"
                  width={60}
                  height={40}
                  className="h-10 w-16 rounded object-cover"
                />
                <span className="truncate text-xs normal-case text-muted-foreground">
                  {form.imageUrl}
                </span>
                <button
                  type="button"
                  onClick={() => update("imageUrl", "")}
                  className="ml-auto text-destructive hover:opacity-80"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-sm border border-dashed border-border bg-background p-3">
                <UploadButton
                  endpoint="restaurantImage"
                  onUploadProgress={() => setUploading(true)}
                  onClientUploadComplete={(res) => {
                    setUploading(false);
                    const url = res?.[0]?.ufsUrl || res?.[0]?.url;
                    if (url) update("imageUrl", url);
                  }}
                  onUploadError={(error: Error) => {
                    setUploading(false);
                    alert(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button:
                      "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md",
                    allowedContent: "text-muted-foreground text-[11px]",
                  }}
                />
                <span className="text-xs normal-case text-muted-foreground">
                  {uploading
                    ? "Uploading banner..."
                    : "Upload banner or cover image"}
                </span>
              </div>
            )}
          </div>

          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            Description
            <textarea
              value={form.description ?? ""}
              onChange={(event) => update("description", event.target.value)}
              rows={3}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-2 border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            disabled={busy || uploading}
            className="bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
}
