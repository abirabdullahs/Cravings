export type RestaurantBadge = "top-rated" | "popular" | "closed"

export type Restaurant = {
  id: string
  name: string
  image: string
  rating: number
  /** Short cuisine descriptors shown under the name, e.g. ["Kacchi", "Biryani", "Traditional"] */
  /** Estimated delivery fee in BDT */
  deliveryFee: number
  /** Minimum order value in BDT */
  minOrder: number
  isOpen: boolean
  /** Cuisine keys used for filtering */
  cuisines: string[]
  area: string
}

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
] as const

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Sultan's Dine",
    image: "/food/sultans-dine.png",
    rating: 4.8,
    deliveryFee: 45,
    minOrder: 300,
    // badge: "top-rated",
    isOpen: true,
    cuisines: ["kacchi", "biryani"],
    area: "Dhanmondi",
  },
  {
    id: "2",
    name: "Chillox",
    image: "/food/chillox.png",
    rating: 4.5,
    deliveryFee: 30,
    minOrder: 200,
    // badge: "popular",
    isOpen: true,
    cuisines: ["burger", "fried-chicken"],
    area: "Banani",
  },
  {
    id: "3",
    name: "Kacchi Bhai",
    image: "/food/kacchi-bhai.png",
    rating: 4.7,
    deliveryFee: 40,
    minOrder: 250,
    // badge: "popular",
    isOpen: true,
    cuisines: ["kacchi", "biryani", "bengali"],
    area: "Gulshan",
  },
  {
    id: "4",
    name: "Ambala",
    image: "/food/ambala.png",
    rating: 4.3,
    deliveryFee: 35,
    minOrder: 150,
    // badge: "closed",
    isOpen: false,
    cuisines: ["bengali", "dessert"],
    area: "Old Dhaka",
  },
]
