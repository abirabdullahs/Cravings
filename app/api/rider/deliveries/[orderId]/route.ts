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

    // --- CULPRIT FINDER DIAGNOSTIC ---
    try {
      JSON.stringify(result);
    } catch (stringifyError) {
      console.log("\n==================================================");
      console.log("🔍 CULPRIT FINDER: NON-SERIALIZABLE DATA DETECTED");
      console.log("Raw Result Output:", result);

      if (result && typeof result === "object") {
        Object.entries(result).forEach(([key, value]) => {
          try {
            JSON.stringify(value);
          } catch {
            console.error(`❌ CULPRIT KEY: "${key}"`, {
              type: typeof value,
              constructor: value?.constructor?.name ?? "Unknown",
              value: value,
            });
          }
        });
      }
      console.log("==================================================\n");
    }
    // ---------------------------------

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
