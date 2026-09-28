"use client";

import { useState } from "react";
import { CirclePlus, RotateCcw } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { CategoryPanel } from "@/components/restaurant-manager/CategoryPanel";
import { MenuPanel } from "@/components/restaurant-manager/MenuPanel";
import { RestaurantFormDialog } from "@/components/restaurant-manager/RestaurantFormDialog";
import { RestaurantHeader } from "@/components/restaurant-manager/RestaurantHeader";
import { RestaurantSidebar } from "@/components/restaurant-manager/RestaurantSidebar";
import { useRestaurantManager } from "@/hooks/useRestaurantManager";
import { emptyRestaurantInput } from "@/types/restaurant";
import type { Restaurant, RestaurantInput } from "@/types/restaurant";

export default function RestaurantManager() {
  const {
    restaurants,
    archivedRestaurants,
    selectedRestaurant,
    categories,
    items,
    archivedItems,
    error,
    busy,
    setSelectedId,
    setError,
    saveRestaurant,
    deleteRestaurant,
    restoreRestaurant,
    saveMenuItem,
    toggleMenuItemAvailability,
    deleteMenuItem,
    restoreMenuItem,
    addCategory,
    deleteCategory,
  } = useRestaurantManager();

  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null,
  );

  function openForCreate() {
    setEditingRestaurant(null);
    setShowRestaurantForm(true);
  }

  function openForEdit() {
    if (!selectedRestaurant) return;
    setEditingRestaurant(selectedRestaurant);
    setShowRestaurantForm(true);
  }

  async function handleRestaurantSubmit(input: RestaurantInput) {
    await saveRestaurant(input, editingRestaurant?.id ?? null);
    setShowRestaurantForm(false);
    setEditingRestaurant(null);
  }

  async function handleDeleteRestaurant() {
    if (!selectedRestaurant) return;
    const confirmed = window.confirm(
      `Archive ${selectedRestaurant.name}? Its menu and order history will be preserved.`,
    );
    if (confirmed) await deleteRestaurant();
  }

  return (
    <div className="mx-auto px-14 py-10 sm:px-18 sm:py-12">
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
          onClick={openForCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <CirclePlus className="size-4" /> Add restaurant
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <RestaurantSidebar
            restaurants={restaurants}
            selectedId={selectedRestaurant?.id ?? null}
            onSelect={setSelectedId}
          />
          {archivedRestaurants.length > 0 && (
            <div className="mt-7 border-t border-border pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Archived branches
              </p>
              <div className="grid gap-2">
                {archivedRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between gap-3 border border-border px-3 py-2"
                  >
                    <span className="truncate text-sm text-muted-foreground">
                      {restaurant.name}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void restoreRestaurant(restaurant.id)}
                      aria-label={`Restore ${restaurant.name}`}
                      className="text-primary disabled:opacity-50"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="min-w-0">
          {selectedRestaurant ? (
            <>
              <RestaurantHeader
                restaurant={selectedRestaurant}
                busy={busy}
                onEdit={openForEdit}
                onDelete={handleDeleteRestaurant}
              />
              <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_260px]">
                <MenuPanel
                  items={items}
                  archivedItems={archivedItems}
                  categories={categories}
                  busy={busy}
                  onSave={saveMenuItem}
                  onToggleAvailability={toggleMenuItemAvailability}
                  onDelete={deleteMenuItem}
                  onRestore={restoreMenuItem}
                />
                <CategoryPanel
                  categories={categories}
                  onAdd={addCategory}
                  onDelete={deleteCategory}
                />
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
        <RestaurantFormDialog
          key={editingRestaurant?.id ?? "new"}
          initialValue={
            editingRestaurant
              ? restaurantToInput(editingRestaurant)
              : emptyRestaurantInput
          }
          isEditing={Boolean(editingRestaurant)}
          busy={busy}
          onSubmit={handleRestaurantSubmit}
          onClose={() => {
            setShowRestaurantForm(false);
            setEditingRestaurant(null);
          }}
        />
      )}
    </div>
  );
}

function restaurantToInput(restaurant: Restaurant): RestaurantInput {
  return {
    name: restaurant.name,
    description: restaurant.description ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    address: restaurant.address,
    area: restaurant.area ?? "",
    latitude: restaurant.latitude ?? null,
    longitude: restaurant.longitude ?? null,
    cuisines: restaurant.cuisines,
    openingTime: restaurant.openingTime ?? "",
    closingTime: restaurant.closingTime ?? "",
    deliveryFee: restaurant.deliveryFee,
    minimumOrder: restaurant.minimumOrder,
    isActive: restaurant.isActive,
    imageUrl: restaurant.imageUrl ?? "",
  };
}
