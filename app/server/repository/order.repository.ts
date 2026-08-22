import { pool } from "@/app/lib/db";
import { CALL_CREATE_ORDER_PROCEDURE, CANCEL_DELIVERY_ON_ORDER_CANCEL, CANCEL_ORDER } from "../query/order.query";

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
  try{
    await pool.query(CALL_CREATE_ORDER_PROCEDURE);
  }catch(error){
    throw error;
  }
 
};

export const cancelOrder = async (orderId: string) => {
  try {
    await pool.query("BEGIN");
    await pool.query(CANCEL_ORDER, [orderId]);
    await pool.query(CANCEL_DELIVERY_ON_ORDER_CANCEL, [orderId]);
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};
