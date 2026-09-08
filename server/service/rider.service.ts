import { acceptRequest } from "../repository/rider.repository";

export const updateDeliveryStatus = async (deliveryId: number, status: string) => {
  switch(status){
    case "accepted": await acceptRequest(deliveryId);

  }
}