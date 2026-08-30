import { getAuthenticatedUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

export default async function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) redirect("/login");

  return <>{children}</>;
}
