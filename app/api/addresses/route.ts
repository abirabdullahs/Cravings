import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  getUserAddresses,
  createAddress,
  updateAddressRecord,
  removeAddress,
} from "@/server/service/address.service";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json(await getUserAddresses(user.id));
  } catch (error: unknown) {
    return handleApiError(error, "Unable to fetch addresses");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    const {
      label,
      address,
      street,
      apartmentName,
      city,
      postalCode,
      latitude,
      longitude,
    } = body;

    if (!address || !city) {
      throw new AppError(
        ErrorCode.MISSING_FIELD,
        "Address and city are required",
      );
    }

    const newAddress = await createAddress({
      userId: user.id,
      label,
      address,
      street,
      apartmentName,
      city,
      postalCode,
      latitude,
      longitude,
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to create address");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    const {
      id,
      label,
      address,
      street,
      apartmentName,
      city,
      postalCode,
      latitude,
      longitude,
    } = body;

    if (!id) {
      throw new AppError(ErrorCode.MISSING_FIELD, "Address ID is required");
    }

    if (!address || !city) {
      throw new AppError(
        ErrorCode.MISSING_FIELD,
        "Address and city are required",
      );
    }

    const updatedAddress = await updateAddressRecord({
      addressId: id,
      userId: user.id,
      label,
      address,
      street,
      apartmentName,
      city,
      postalCode,
      latitude,
      longitude,
    });

    if (!updatedAddress) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Address not found or unauthorized",
      );
    }

    return NextResponse.json(updatedAddress);
  } catch (error: unknown) {
    return handleApiError(error, "Unable to update address");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new AppError(ErrorCode.MISSING_FIELD, "Address ID is required");
    }

    const deletedId = await removeAddress(id, user.id);

    if (!deletedId) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "Address not found or unauthorized",
      );
    }

    return NextResponse.json({ success: true, id: deletedId });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to delete address");
  }
}
