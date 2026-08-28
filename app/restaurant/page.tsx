"use client";

import { useState } from "react";
import { CirclePlus } from "lucide-react";
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
    selectedRestaurant,
    categories,
    items,
    error,
    busy,
    setSelectedId,
    setError,
    saveRestaurant,
    deleteRestaurant,
    saveMenuItem,
    toggleMenuItemAvailability,
    deleteMenuItem,
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
      `Delete ${selectedRestaurant.name}? Its menu will also be deleted.`,
    );
    if (confirmed) await deleteRestaurant();
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
          onClick={openForCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <CirclePlus className="size-4" /> Add restaurant
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <RestaurantSidebar
          restaurants={restaurants}
          selectedId={selectedRestaurant?.id ?? null}
          onSelect={setSelectedId}
        />

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
                  categories={categories}
                  busy={busy}
                  onSave={saveMenuItem}
                  onToggleAvailability={toggleMenuItemAvailability}
                  onDelete={deleteMenuItem}
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
    openingTime: restaurant.openingTime ?? "",
    closingTime: restaurant.closingTime ?? "",
    deliveryFee: restaurant.deliveryFee,
    minimumOrder: restaurant.minimumOrder,
    isActive: restaurant.isActive,
  };
}
