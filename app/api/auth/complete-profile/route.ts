import { completeProfile } from "@/app/server/service/auth.service";
import { auth, unstable_update } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { phone, role } = await request.json();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session?.user?.phone || !session?.user?.role) {
      const id = session?.user?.id as string;
      const data = await completeProfile({ role, phone, id });
      await unstable_update({
        user: {role, phone },
      });
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: "Profile already completed" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in POST /api/auth/complete-profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
