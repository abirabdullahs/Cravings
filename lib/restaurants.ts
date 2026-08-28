import type { RestaurantSummary } from "@/types/restaurant";

export type RestaurantBadge = "top-rated" | "popular" | "closed";
export type Restaurant = RestaurantSummary;

export const CUISINES = [
  { key: "all", label: "All" },
  { key: "kacchi", label: "Kacchi" },
  { key: "biryani", label: "Biryani" },
  { key: "bengali", label: "Bengali" },
  { key: "burger", label: "Burger" },
  { key: "pizza", label: "Pizza" },
  { key: "fried-chicken", label: "Fried Chicken" },
  { key: "chinese", label: "Chinese" },
  { key: "cafe", label: "Cafe" },
  { key: "dessert", label: "Dessert" },
] as const;

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Sultan's Dine",
    imageUrl: "/food/sultans-dine.png",
    rating: 4.8,
    deliveryFee: 45,
    minimumOrder: 300,
    // badge: "top-rated",
    isActive: true,
    cuisines: ["kacchi", "biryani"],
    area: "Dhanmondi",
  },
  {
    id: 2,
    name: "Chillox",
    imageUrl: "/food/chillox.png",
    rating: 4.5,
    deliveryFee: 30,
    minimumOrder: 200,
    // badge: "popular",
    isActive: true,
    cuisines: ["burger", "fried-chicken"],
    area: "Banani",
  },
  {
    id: 3,
    name: "Kacchi Bhai",
    imageUrl: "/food/kacchi-bhai.png",
    rating: 4.7,
    deliveryFee: 40,
    minimumOrder: 250,
    // badge: "popular",
    isActive: true,
    cuisines: ["kacchi", "biryani", "bengali"],
    area: "Gulshan",
  },
  {
    id: 4,
    name: "Ambala",
    imageUrl: "/food/ambala.png",
    rating: 4.3,
    deliveryFee: 35,
    minimumOrder: 150,
    // badge: "closed",
    isActive: false,
    cuisines: ["bengali", "dessert"],
    area: "Old Dhaka",
  },
];
