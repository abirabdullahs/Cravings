import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { MenuCategory } from "@/types/restaurant";

interface CategoryPanelProps {
  categories: MenuCategory[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (categoryId: number) => void;
}

export function CategoryPanel({ categories, onAdd, onDelete }: CategoryPanelProps) {
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await onAdd(name);
    setName("");
  }

  return (
    <div className="border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-6">
      <h3 className="font-serif text-xl font-bold text-foreground">Categories</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Organize the menu for easy browsing.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Main course"
          className="h-9 min-w-0 flex-1 border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
        />
        <button
          aria-label="Add category"
          className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-foreground"
        >
          <Plus className="size-4" />
        </button>
      </form>
      <div className="mt-4 grid gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between border-b border-border py-2 text-sm text-foreground"
          >
            <span>{category.name}</span>
            <button
              onClick={() => onDelete(category.id)}
              aria-label={`Delete ${category.name}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
