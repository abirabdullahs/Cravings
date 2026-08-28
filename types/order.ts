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

export interface CartItemInput {
  menuItemId: number;
  restaurantId: number;
  quantity: number;
}
