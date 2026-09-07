import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getUserAddresses } from "@/server/service/address.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json(await getUserAddresses(user.id));
  } catch (error: unknown) {
    return handleApiError(error, "Unable to fetch addresses");
  }
}