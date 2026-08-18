import { pool } from "@/app/lib/db";

export const createOrder = async ({
  userId,
  cartId,
  addressId,
  deliveryFee,
  paymentMethod,
}: {
  userId: string;
  cartId: string;
  addressId: string;
  deliveryFee: number;
  paymentMethod: string;
}) => {
  //try {
  // await pool.query("BEGIN");
  // const order = await pool.query(Insert_Order, [userId, cartId, addressId, deliveryFee]);
  // const orderItems = await pool.query(Insert_Order_Items, [order.rows[0].id, cartId]);
  // const cart = await pool.query(Delete_Cart, [cartId]);
  // const stock = await pool.query(Reduce_Stock, [cartId]);
  // const userCoupon = await pool.query(Delete_User_Coupon, [cartId]);
  // const payment = await pool.query(Insert_Payment, [order.rows[0].id, order.rows[0].total_amount, paymentMethod]);
  // const delivery = await pool.query(Insert_Delivery, [order.rows[0].id, userId]);
  // await pool.query("COMMIT");
  //   return order.rows[0];
  // } catch (error) {
  //   await pool.query("ROLLBACK");
  //   throw error;
  // }
};

export const cancelOrder = async (orderId: string) => {
  try {
    await pool.query("BEGIN");
    await pool.query(Cancel_Order, [orderId]);
    await pool.query(Increase_Stock, [orderId]);
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};
