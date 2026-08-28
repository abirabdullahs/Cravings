export interface RestaurantSummary {
  id: number;
  name: string;
  imageUrl?: string;
  rating: number;
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
  cuisines: string[];
  area?: string;
}

export interface Restaurant extends RestaurantSummary {
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  openingTime?: string;
  closingTime?: string;
}

export interface MenuCategory {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId?: number;
  categoryName?: string;
}

export interface RestaurantMenu {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface RestaurantSearchFilter {
  search?: string;
  cuisine?: string;
  area?: string;
  sort?: string;
  restaurantId?: string;
  limit?: number;
}

// Form data is intentionally separate from Restaurant because the server owns
// the id, rating, cuisines, and other read-only fields.
export interface RestaurantInput {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
}

export interface MenuItemInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number | null;
}

export const emptyRestaurantInput: RestaurantInput = {
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  openingTime: "",
  closingTime: "",
  deliveryFee: 0,
  minimumOrder: 0,
  isActive: false,
};

export const emptyMenuItemInput: MenuItemInput = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  categoryId: null,
};
