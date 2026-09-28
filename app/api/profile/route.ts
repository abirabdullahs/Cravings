import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  getUserByEmail,
  updateOwnProfile,
  getRoleRequestForUser,
} from "@/server/service/auth.service";
import { getUserAddresses } from "@/server/service/address.service";

const roleFields: Record<string, string[]> = {
  rider: ["nid_number", "vehicle_type", "vehicle_plate", "license_number"],
  owner: [
    "nid_number",
    "restaurant_name",
    "business_address",
    "trade_license",
  ],
};

function ownRoleDetails(
  role: string,
  verificationData: Record<string, unknown> | undefined,
) {
  const allowed = roleFields[role] ?? [];
  return Object.fromEntries(
    allowed.flatMap((key) => {
      const value = verificationData?.[key];
      return value === undefined || value === null || String(value).trim() === ""
        ? []
        : [[key, String(value)]];
    }),
  );
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const role = String(user.role ?? "customer");
    const [activeRequest, addresses] = await Promise.all([
      getRoleRequestForUser(String(user.id)),
      getUserAddresses(user.id),
    ]);
    const savedAddress = addresses[0];
    const address = savedAddress
      ? [savedAddress.address, savedAddress.city, savedAddress.postalCode]
          .filter(Boolean)
          .join(", ")
      : null;

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        role,
        created_at: user.created_at,
        account_status:
          activeRequest?.status === "APPROVED"
            ? "active"
            : (activeRequest?.status ?? "active"),
        address,
        role_details: ownRoleDetails(role, activeRequest?.verification_data),
        application: activeRequest
          ? {
              id: activeRequest.id,
              status: activeRequest.status,
              requested_role: activeRequest.requested_role,
              source_role: activeRequest.source_role,
              verification_data: activeRequest.verification_data ?? {},
              rejection_reason: activeRequest.rejection_reason,
              created_at: activeRequest.created_at,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to load profile");
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }

    const payload = await request.json();
    const updated = await updateOwnProfile({
      id: String(user.id),
      name: typeof payload.name === "string" ? payload.name : undefined,
      phone: typeof payload.phone === "string" ? payload.phone : undefined,
      profileImage:
        typeof payload.profile_image === "string"
          ? payload.profile_image
          : undefined,
    });

    return NextResponse.json({
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        profile_image: updated.profile_image,
        role: updated.role,
        created_at: updated.created_at,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to update profile");
  }
}
