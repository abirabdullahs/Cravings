import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { NextResponse } from "next/server";
import { updateDeliveryStatus } from "@/server/service/rider.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();
    const user = await requireRider();

    const result = await updateDeliveryStatus(
      Number(orderId),
      Number(user.id),
      status,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
