import { completeProfile, normalizeRole } from "@/server/service/auth.service";
import { auth, unstable_update } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { phone, role, verificationData } = await request.json();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedRole = typeof role === "string" ? role : "customer";
    const normalizedRole = normalizeRole(requestedRole);
    if (normalizedRole === "admin") {
      return NextResponse.json(
        { error: "Admin role cannot be assigned during profile completion" },
        { status: 400 },
      );
    }

    if (!session?.user?.phone || !session?.user?.role) {
      const id = session?.user?.id as string;
      const data = await completeProfile({
        role: requestedRole,
        phone,
        id,
        verificationData,
      });
      await unstable_update({
        user: { role: "customer", phone },
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
