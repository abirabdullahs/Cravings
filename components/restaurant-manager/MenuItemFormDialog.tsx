import { FormEvent, useState } from "react";
import Image from "next/image";
import { Check, X, Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { UploadButton } from "@/lib/uploadthing";
import type { MenuCategory, MenuItemInput } from "@/types/restaurant";

interface MenuItemFormDialogProps {
  initialValue: MenuItemInput;
  isEditing: boolean;
  categories: MenuCategory[];
  busy: boolean;
  onSubmit: (input: MenuItemInput) => Promise<void> | void;
  onClose: () => void;
}

export function MenuItemFormDialog({
  initialValue,
  isEditing,
  categories,
  busy,
  onSubmit,
  onClose,
}: MenuItemFormDialogProps) {
  const [form, setForm] = useState<MenuItemInput>(initialValue);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof MenuItemInput>(
    key: K,
    value: MenuItemInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 grid gap-4 border border-primary/40 bg-primary/5 p-5 sm:grid-cols-2"
    >
      <div className="flex items-center justify-between sm:col-span-2">
        <h4 className="font-semibold text-foreground">
          {isEditing ? "Edit menu item" : "New menu item"}
        </h4>
        <button type="button" onClick={onClose} aria-label="Close menu form">
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      <FormField
        label="Item name"
        name="name"
        required
        value={form.name}
        onChange={(value) => update("name", value)}
      />

      <FormField
        label="Price"
        name="price"
        type="number"
        required
        value={form.price}
        onChange={(value) => update("price", Number(value))}
      />

      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Category
        <select
          value={form.categoryId ?? ""}
          onChange={(event) =>
            update(
              "categoryId",
              event.target.value ? Number(event.target.value) : null,
            )
          }
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground"
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {/* Image Upload Integration */}
      <div className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Item Image</span>
        {form.imageUrl ? (
          <div className="flex items-center gap-3 rounded-sm border border-border bg-background p-2">
            <Image
              src={form.imageUrl}
              alt="Item preview"
              width={40}
              height={40}
              className="size-10 rounded object-cover"
            />
            <span className="truncate text-xs normal-case text-muted-foreground">
              {form.imageUrl}
            </span>
            <button
              type="button"
              onClick={() => update("imageUrl", "")}
              className="ml-auto text-destructive hover:opacity-80"
              aria-label="Remove image"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-background p-2">
            <UploadButton
              endpoint="menuItemImage"
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
              {uploading ? "Uploading image..." : "Upload item photo"}
            </span>
          </div>
        )}
      </div>

      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
        Description
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={2}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
        />
      </label>

      <div className="flex gap-2 sm:col-span-2">
        <button
          disabled={busy || uploading}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Check className="size-3.5" /> {busy ? "Saving..." : "Save item"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
