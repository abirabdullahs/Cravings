import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getOrderQuote } from "@/server/service/order.service";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const searchParams = new URL(request.url).searchParams;
    const quote = await getOrderQuote({
      userId: user.id,
      cartId: Number(searchParams.get("cartId")),
      addressId: Number(searchParams.get("addressId")),
    });

    return Response.json(quote);
  } catch (error: unknown) {
    return handleApiError(error, "Unable to calculate order total");
  }
}
