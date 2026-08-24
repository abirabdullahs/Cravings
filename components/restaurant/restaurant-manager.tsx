"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  CirclePlus,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

type Restaurant = {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  opening_time?: string;
  closing_time?: string;
  delivery_fee: number;
  minimum_order: number;
  active_status: boolean;
};
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  item_name: string;
  description?: string;
  price: number;
  item_img?: string;
  is_available: boolean;
  category_id?: number;
  category_name?: string;
};
type RestaurantForm = Omit<
  Restaurant,
  "id" | "delivery_fee" | "minimum_order" | "active_status"
> & {
  delivery_fee: number;
  minimum_order: number;
  active_status: boolean;
};
type MenuForm = {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: number | null;
};

const emptyRestaurant: RestaurantForm = {
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  opening_time: "",
  closing_time: "",
  delivery_fee: 0,
  minimum_order: 0,
  active_status: false,
};
const emptyMenu: MenuForm = {
  name: "",
  description: "",
  price: 0,
  image: "",
  categoryId: null,
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <input
        name={name}
        value={value}
        required={required}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

export function RestaurantManager() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurantForm, setRestaurantForm] =
    useState<RestaurantForm>(emptyRestaurant);
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenu);
  const [editingRestaurant, setEditingRestaurant] = useState<number | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = restaurants.find(
    (restaurant) => restaurant.id === selectedId,
  );
  const base = selectedId ? `/api/owner/restaurants/${selectedId}` : "";

  async function loadRestaurants(selectFirst = false) {
    const data = await request<Restaurant[]>("/api/owner/restaurants");
    setRestaurants(data);
    if (selectFirst && data[0]) setSelectedId(data[0].id);
  }

  async function loadMenu(id: number) {
    const data = await request<{ categories: Category[]; items: MenuItem[] }>(
      `/api/owner/restaurants/${id}/menu`,
    );
    setCategories(data.categories);
    setItems(data.items);
  }

  useEffect(() => {
    let active = true;
    request<Restaurant[]>("/api/owner/restaurants")
      .then((data) => {
        if (!active) return;
        startTransition(() => {
          setRestaurants(data);
          if (data[0]) setSelectedId(data[0].id);
        });
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load restaurants",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    request<{ categories: Category[]; items: MenuItem[] }>(
      `/api/owner/restaurants/${selectedId}/menu`,
    )
      .then((data) => {
        if (!active) return;
        startTransition(() => {
          setCategories(data.categories);
          setItems(data.items);
        });
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "Could not load menu",
          );
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  function startCreateRestaurant() {
    setEditingRestaurant(null);
    setRestaurantForm(emptyRestaurant);
    setShowRestaurantForm(true);
    setError("");
  }
  function startEditRestaurant() {
    if (!selected) return;
    setEditingRestaurant(selected.id);
    setRestaurantForm({ ...selected });
    setShowRestaurantForm(true);
    setError("");
  }
  function startEditItem(item: MenuItem) {
    setEditingItem(item.id);
    setMenuForm({
      name: item.item_name,
      description: item.description || "",
      price: Number(item.price),
      image: item.item_img || "",
      categoryId: item.category_id || null,
    });
    setShowMenuForm(true);
  }

  async function saveRestaurant(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await request<Restaurant>(
        editingRestaurant
          ? `/api/owner/restaurants/${editingRestaurant}`
          : "/api/owner/restaurants",
        {
          method: editingRestaurant ? "PUT" : "POST",
          body: JSON.stringify(restaurantForm),
        },
      );
      await loadRestaurants();
      setSelectedId(data.id);
      setShowRestaurantForm(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save restaurant",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeRestaurant() {
    if (
      !selected ||
      !window.confirm(`Delete ${selected.name}? Its menu will also be deleted.`)
    )
      return;
    setBusy(true);
    setError("");
    try {
      await request(`${base}`, { method: "DELETE" });
      const remaining = restaurants.filter((item) => item.id !== selected.id);
      setRestaurants(remaining);
      setSelectedId(remaining[0]?.id || null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not delete restaurant",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveMenuItem(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setError("");
    try {
      const url = editingItem ? `${base}/menu/${editingItem}` : `${base}/menu`;
      await request(url, {
        method: editingItem ? "PUT" : "POST",
        body: JSON.stringify(menuForm),
      });
      await loadMenu(selectedId);
      setMenuForm(emptyMenu);
      setEditingItem(null);
      setShowMenuForm(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save menu item",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleItem(item: MenuItem) {
    try {
      await request(`${base}/menu/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ available: !item.is_available }),
      });
      await loadMenu(selectedId!);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update item",
      );
    }
  }
  async function removeItem(item: MenuItem) {
    if (!window.confirm(`Remove ${item.item_name}?`)) return;
    try {
      await request(`${base}/menu/${item.id}`, { method: "DELETE" });
      await loadMenu(selectedId!);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not delete item",
      );
    }
  }
  async function addCategory(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !categoryName.trim()) return;
    try {
      await request(`${base}/categories`, {
        method: "POST",
        body: JSON.stringify({ name: categoryName }),
      });
      setCategoryName("");
      await loadMenu(selectedId);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not add category",
      );
    }
  }
  async function removeCategory(id: number) {
    if (
      !window.confirm("Delete this category? Items will become uncategorized.")
    )
      return;
    try {
      await request(`${base}/categories?categoryId=${id}`, {
        method: "DELETE",
      });
      await loadMenu(selectedId!);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not delete category",
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Owner studio
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your restaurants
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Keep your branches, menu, and availability in step with the kitchen.
          </p>
        </div>
        <button
          onClick={startCreateRestaurant}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <CirclePlus className="size-4" /> Add restaurant
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Branches{" "}
            <span className="ml-1 text-foreground">{restaurants.length}</span>
          </p>
          <div className="grid gap-2">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => setSelectedId(restaurant.id)}
                className={`flex items-center justify-between border px-4 py-3 text-left transition ${selectedId === restaurant.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {restaurant.name}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {restaurant.address}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
            {!restaurants.length && (
              <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">
                No restaurants yet. Add your first branch to start building its
                menu.
              </div>
            )}
          </div>
        </aside>
        <section className="min-w-0">
          {selected ? (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      {selected.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${selected.active_status ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${selected.active_status ? "bg-primary" : "bg-muted-foreground"}`}
                      />
                      {selected.active_status ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startEditRestaurant}
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary"
                  >
                    <Pencil className="size-3.5" /> Edit details
                  </button>
                  <button
                    onClick={removeRestaurant}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
              <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_260px]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        Menu
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {items.length} item{items.length === 1 ? "" : "s"}{" "}
                        across {categories.length} categor
                        {categories.length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setMenuForm(emptyMenu);
                        setShowMenuForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-3.5" /> Add item
                    </button>
                  </div>
                  {showMenuForm && (
                    <form
                      onSubmit={saveMenuItem}
                      className="mb-5 grid gap-4 border border-primary/40 bg-primary/5 p-5 sm:grid-cols-2"
                    >
                      <div className="sm:col-span-2 flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">
                          {editingItem ? "Edit menu item" : "New menu item"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowMenuForm(false)}
                          aria-label="Close menu form"
                        >
                          <X className="size-4 text-muted-foreground" />
                        </button>
                      </div>
                      <Field
                        label="Item name"
                        name="name"
                        required
                        value={menuForm.name}
                        onChange={(value) =>
                          setMenuForm({ ...menuForm, name: value })
                        }
                      />
                      <Field
                        label="Price"
                        name="price"
                        type="number"
                        required
                        value={menuForm.price}
                        onChange={(value) =>
                          setMenuForm({ ...menuForm, price: Number(value) })
                        }
                      />
                      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Category
                        <select
                          value={menuForm.categoryId || ""}
                          onChange={(event) =>
                            setMenuForm({
                              ...menuForm,
                              categoryId: event.target.value
                                ? Number(event.target.value)
                                : null,
                            })
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
                      <Field
                        label="Image URL"
                        name="image"
                        value={menuForm.image}
                        onChange={(value) =>
                          setMenuForm({ ...menuForm, image: value })
                        }
                      />
                      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
                        Description
                        <textarea
                          value={menuForm.description}
                          onChange={(event) =>
                            setMenuForm({
                              ...menuForm,
                              description: event.target.value,
                            })
                          }
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
                          onClick={() => setShowMenuForm(false)}
                          className="px-4 py-2 text-xs font-semibold text-muted-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  {items.length ? (
                    <div className="divide-y divide-border border-y border-border">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 py-4"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center bg-secondary text-primary">
                            <Utensils className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-sm font-semibold text-foreground">
                                {item.item_name}
                              </h4>
                              {item.category_name && (
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {item.category_name}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {item.description || "No description"}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            ৳{Number(item.price).toFixed(0)}
                          </span>
                          <button
                            onClick={() => toggleItem(item)}
                            className={`hidden border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:block ${item.is_available ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}
                          >
                            {item.is_available ? "Available" : "Hidden"}
                          </button>
                          <button
                            onClick={() => startEditItem(item)}
                            aria-label={`Edit ${item.item_name}`}
                            className="p-1.5 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item)}
                            aria-label={`Delete ${item.item_name}`}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
                      Your menu is empty. Add the dishes your customers come
                      for.
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-6">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Categories
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Organize the menu for easy browsing.
                  </p>
                  <form onSubmit={addCategory} className="mt-4 flex gap-2">
                    <input
                      value={categoryName}
                      onChange={(event) => setCategoryName(event.target.value)}
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
                          onClick={() => removeCategory(category.id)}
                          aria-label={`Delete ${category.name}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Select a restaurant to manage its menu.
            </div>
          )}
        </section>
      </div>
      {showRestaurantForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 px-4 py-10">
          <form
            onSubmit={saveRestaurant}
            className="w-full max-w-2xl border border-border bg-background p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between border-b border-border pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {editingRestaurant ? "Update branch" : "New branch"}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                  Restaurant details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRestaurantForm(false)}
                aria-label="Close restaurant form"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Restaurant name"
                name="name"
                required
                value={restaurantForm.name}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, name: value })
                }
              />
              <Field
                label="Phone"
                name="phone"
                value={restaurantForm.phone || ""}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, phone: value })
                }
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={restaurantForm.email || ""}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, email: value })
                }
              />
              <Field
                label="Address"
                name="address"
                required
                value={restaurantForm.address}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, address: value })
                }
              />
              <Field
                label="Opening time"
                name="opening_time"
                type="time"
                value={restaurantForm.opening_time || ""}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, opening_time: value })
                }
              />
              <Field
                label="Closing time"
                name="closing_time"
                type="time"
                value={restaurantForm.closing_time || ""}
                onChange={(value) =>
                  setRestaurantForm({ ...restaurantForm, closing_time: value })
                }
              />
              <Field
                label="Delivery fee"
                name="delivery_fee"
                type="number"
                value={restaurantForm.delivery_fee}
                onChange={(value) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    delivery_fee: Number(value),
                  })
                }
              />
              <Field
                label="Minimum order"
                name="minimum_order"
                type="number"
                value={restaurantForm.minimum_order}
                onChange={(value) =>
                  setRestaurantForm({
                    ...restaurantForm,
                    minimum_order: Number(value),
                  })
                }
              />
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
                Description
                <textarea
                  value={restaurantForm.description || ""}
                  onChange={(event) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
                />
              </label>
              
            </div>
            <div className="mt-7 flex justify-end gap-2 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setShowRestaurantForm(false)}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                {editingRestaurant ? "Save changes" : "Create restaurant"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
