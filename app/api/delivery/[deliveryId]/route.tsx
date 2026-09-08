import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, params: Promise<{deliveryId: string}>){
  try{
  const deliveryId = await params;
  const {status} = await request.json();
  const user = await requireRider();
  return NextResponse.json(await updateDeliveryStatus(deliveryId, status), {status: 200});
  }catch(err: unknown){
    return handleApiError(err);
  }
}