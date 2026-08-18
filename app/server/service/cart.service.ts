import { findCart, insertCart, upsertCartItem } from "../repository/cart.repository";

export const addCartItem = async ({userId, restaurantId, menuItemId, quantity}:{
  userId: string, restaurantId: string, menuItemId: string, quantity: number}) => {
    let cart = await findCart({userId, restaurantId});
    if(!cart) {
      cart = await insertCart({userId, restaurantId});
    }
    const data = await upsertCartItem({menuItemId, quantity, cartId: cart.id})
    return data;
  }

export const getCartItems = async({userId, restaurantId}: {
  userId: string, restaurantId: string|null }) =>{
    

}