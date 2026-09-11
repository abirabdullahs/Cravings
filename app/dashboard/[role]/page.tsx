import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default async function DashboardDynamicPage({ params }: { params: Promise<{ role: string }> }) {
  const session = await auth();
  const { role } = await params;
  const normalizedRole = String(role ?? "").toLowerCase();

  if (!session?.user?.id) {
    redirect("/unauthorized");
  }

  const currentRole = String(session.user.role ?? "customer").toLowerCase();
  const allowed = ["admin", "owner", "rider", "customer"];
  if (!allowed.includes(normalizedRole)) {
    redirect("/unauthorized");
  }

  if (currentRole !== normalizedRole && currentRole !== "admin") {
    redirect("/unauthorized");
  }

  return <DashboardPage role={normalizedRole as "admin" | "owner" | "rider" | "customer"} />;
}
