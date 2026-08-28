import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuItemFormDialog } from "@/components/restaurant-manager/MenuItemFormDialog";
import { MenuItemRow } from "@/components/restaurant-manager/MenuItemRow";
import { emptyMenuItemInput } from "@/types/restaurant";
import type { MenuCategory, MenuItem, MenuItemInput } from "@/types/restaurant";

interface MenuPanelProps {
  items: MenuItem[];
  categories: MenuCategory[];
  busy: boolean;
  onSave: (input: MenuItemInput, editingId: number | null) => Promise<void>;
  onToggleAvailability: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuPanel({
  items,
  categories,
  busy,
  onSave,
  onToggleAvailability,
  onDelete,
}: MenuPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  function openForCreate() {
    setEditingItem(null);
    setShowForm(true);
  }

  function openForEdit(item: MenuItem) {
    setEditingItem(item);
    setShowForm(true);
  }

  async function handleSubmit(input: MenuItemInput) {
    await onSave(input, editingItem?.id ?? null);
    setShowForm(false);
    setEditingItem(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">Menu</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} across {categories.length}{" "}
            categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <button
          onClick={openForCreate}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Plus className="size-3.5" /> Add item
        </button>
      </div>

      {showForm && (
        <MenuItemFormDialog
          initialValue={editingItem ? itemToInput(editingItem) : emptyMenuItemInput}
          isEditing={Boolean(editingItem)}
          categories={categories}
          busy={busy}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {items.length ? (
        <div className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              onToggleAvailability={onToggleAvailability}
              onEdit={openForEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Your menu is empty. Add the dishes your customers come for.
        </div>
      )}
    </div>
  );
}

function itemToInput(item: MenuItem): MenuItemInput {
  return {
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    imageUrl: item.imageUrl ?? "",
    categoryId: item.categoryId ?? null,
  };
}
