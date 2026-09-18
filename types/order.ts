export interface CartItem {
  id: number;
  cartId: number;
  menuItemId: number;
  menuItemName: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Cart {
  id: number;
  restaurantId: number;
  restaurantName: string;
  cartItems: CartItem[];
}

export interface CartItemInput {
  menuItemId: number;
  restaurantId: number;
  quantity: number;
}

export interface UserAddress {
  id?: number;
  label?: string;
  address: string;
  street?: string;
  apartmentName?: string;
  city: string;
  postalCode?: string;
  longitude?: number | null;
  latitude?: number | null;
}

export interface CreateOrderInput {
  cartId: number;
  addressId: number;
  deliveryFee: number;
  paymentMethod: "card" | "mobile_banking" | "bank_transfer" | "cash";
}

export interface CreatedOrder {
  id: number;
  restaurantId: number;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  status: string;
}

export interface OrderHistoryItem {
  id: number;
  restaurantId: number;
  restaurantName: string;
  orderStatus: string;
  createdAt: string;
  totalItems: number;
  totalAmount: number;
  riderId: number | null;
  riderName: string | null;
  isReviewed: boolean;
}

export interface OrderDetailItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}


export interface RestaurantOrder {
  id: number;
  customerName: string;
  orderStatus: string;
  createdAt: string;
  totalItems: number;
  totalAmount?: number;
}

export interface SubmitReviewInput {
  orderId: number;
  restaurantId: number;
  riderId?: number | null;
  rating: number;
  riderRating: number | null;
  comment: string;
}
