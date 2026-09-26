"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Chip } from "@/components/common/chip";
import type { MenuItem, RestaurantMenu } from "@/types/restaurant";
import { RestaurantMenuSection } from "@/components/restaurant/restaurant-menu-section";
import { RestaurantOrderPanel } from "@/components/restaurant/restaurant-order-panel";
import type { CartItem } from "@/types/order";

export function RestaurantDetailContent({
  menu,
  cartItems,
  cartId,
  restaurantId,
  onAddItem,
  isLoading = false,
}: {
  menu?: RestaurantMenu;
  cartItems?: CartItem[];
  cartId?: number;
  restaurantId?: number;
  onAddItem?: (item: MenuItem, quantity: number) => Promise<void>;
  isLoading?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [cartError, setCartError] = useState<string | null>(null);
  const [order, setOrder] = useState<Array<MenuItem & { quantity: number }>>(
    cartItems?.map((item) => ({
      id: item.menuItemId,
      name: item.menuItemName,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
      isAvailable: true,
      quantity: item.quantity,
    })) ?? [],
  );
  const visibleItems = (() => {
    if (!menu?.items) return [];
    const query = search.trim().toLowerCase();
    return menu.items.filter((item) => {
      const matchesCategory =
        activeCategory === null || item.categoryId === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  })();

  const categoryTitle =
    menu?.categories.find((category) => category.id === activeCategory)?.name ??
    "Menu";

  if (isLoading || !menu || !restaurantId || !onAddItem) {
    // return <RestaurantDetailSkeleton />;
    return <>lodaing</>;
  }

  async function addItem(item: MenuItem) {
    const quantity =
      (order.find((line) => line.id === item.id)?.quantity || 0) + 1;
    setCartError(null);
    try {
      await onAddItem!(item, quantity);
      setOrder((current) => {
        const existing = current.find((line) => line.id === item.id);
        return existing
          ? current.map((line) =>
              line.id === item.id ? { ...line, quantity } : line,
            )
          : [...current, { ...item, quantity }];
      });
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Unable to update cart");
    }
  }

  async function changeItem(item: MenuItem, amount: number) {
    setCartError(null);
    try {
      await onAddItem!(item, amount);
      setOrder((current) =>
        current
          .map((line) =>
            line.id === item.id ? { ...line, quantity: amount } : line,
          )
          .filter((line) => line.quantity > 0),
      );
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Unable to update cart");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-20 border-y border-border bg-background/95 py-3 backdrop-blur md:top-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
            <Chip
              selected={activeCategory === null}
              onClick={() => setActiveCategory(null)}
            >
              All
            </Chip>
            {menu.categories.map((category) => (
              <Chip
                key={category.id}
                selected={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Chip>
            ))}
          </div>
          <label className="flex h-10 shrink-0 items-center gap-2 border border-border bg-card px-3 text-sm text-muted-foreground sm:w-64">
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">Search menu</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu"
              className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <RestaurantMenuSection
            title={categoryTitle}
            items={visibleItems}
            onAdd={addItem}
          />
          {!visibleItems.length && (
            <p className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No menu items match your search.
            </p>
          )}
          <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            All prices include applicable taxes. Food is prepared fresh to order
            and may contain common allergens.
          </p>
        </div>
        <RestaurantOrderPanel
          items={order}
          cartId={cartId}
          restaurantId={restaurantId}
          onChange={changeItem}
        />
        {cartError && (
          <p className="text-sm text-destructive lg:col-start-2">{cartError}</p>
        )}
      </div>
    </div>
  );
}
