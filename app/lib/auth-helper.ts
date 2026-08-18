import { auth } from "@/auth";

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      errorResponse: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    user: session.user as { id: string; email?: string },
    errorResponse: null,
  };
}
