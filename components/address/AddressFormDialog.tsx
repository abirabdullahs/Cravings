"use client";

import { useEffect, useState } from "react";
import type { UserAddress } from "@/types/order";
import { LocationPicker } from "./LocationPicker";

interface AddressFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: UserAddress) => Promise<void | UserAddress>;
  initialAddress?: UserAddress;
  isLoading?: boolean;
}

const EMPTY_FORM: UserAddress = {
  label: "",
  address: "",
  street: "",
  apartmentName: "",
  city: "",
  postalCode: "",
  latitude: null,
  longitude: null,
};

export function AddressFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialAddress,
  isLoading = false,
}: AddressFormDialogProps) {
  const [formData, setFormData] = useState<UserAddress>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialAddress ? { ...EMPTY_FORM, ...initialAddress } : EMPTY_FORM,
      );
      setErrors({});
    }
  }, [isOpen, initialAddress]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [name]: num !== null && !isNaN(num) ? num : null,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setIsLocating(false);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Unable to retrieve location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("Failed to save address:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {initialAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating || isLoading}
            className="border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            {isLocating ? "Locating..." : "📍 Detect Location"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Interactive Map Selector */}
          <div>
            <label className="mb-1 block font-medium text-muted-foreground">
              Select Pin Location on Map
            </label>
            <LocationPicker
              latitude={formData.latitude??null}
              longitude={formData.longitude??null}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-muted-foreground">
              Address Label
            </label>
            <input
              type="text"
              name="label"
              value={formData.label || ""}
              onChange={handleChange}
              placeholder="e.g., Home, Work"
              className="w-full border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-muted-foreground">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="123 Main Street"
              className={`w-full border bg-background p-2 text-foreground focus:outline-none ${
                errors.address
                  ? "border-destructive"
                  : "border-border focus:border-primary"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-muted-foreground">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                placeholder="City"
                className={`w-full border bg-background p-2 text-foreground focus:outline-none ${
                  errors.city
                    ? "border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-destructive">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-muted-foreground">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ""}
                onChange={handleChange}
                placeholder="12345"
                className="w-full border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-muted-foreground">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude ?? ""}
                onChange={handleCoordinateChange}
                placeholder="23.8103"
                className="w-full border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-muted-foreground">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude ?? ""}
                onChange={handleCoordinateChange}
                placeholder="90.4125"
                className="w-full border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isLocating}
              className="flex-1 border border-border bg-background py-2 font-semibold text-muted-foreground hover:bg-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isLocating}
              className="flex-1 bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
