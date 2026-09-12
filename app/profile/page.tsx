import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/profile/ProfilePage";

export default async function ProfileRoutePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return <ProfilePage />;
}
