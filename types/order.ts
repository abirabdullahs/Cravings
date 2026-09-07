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
  id: number;
  label?: string;
  address: string;
  street?: string;
  apartmentName?: string;
  city: string;
  postalCode?: string;
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
