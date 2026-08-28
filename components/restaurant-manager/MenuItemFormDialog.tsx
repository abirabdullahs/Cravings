import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
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
  const [form, setForm] = useState(initialValue);

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
      <FormField
        label="Image URL"
        name="imageUrl"
        value={form.imageUrl}
        onChange={(value) => update("imageUrl", value)}
      />
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
          disabled={busy}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Check className="size-3.5" /> Save item
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
