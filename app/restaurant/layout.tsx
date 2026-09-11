import { getAuthenticatedUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { RestaurantNavbar } from "@/components/restaurant-manager/RestaurantNavbar";

export default async function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user || user.role?.toLowerCase() !== "owner") redirect("/login");

  return (
    <>
      <RestaurantNavbar />
      {children}
    </>
  );
}
