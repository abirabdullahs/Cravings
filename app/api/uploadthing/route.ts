import { NextRequest, NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { auth } from "@/auth";

import { ourFileRouter } from "./core";

const uploadHandler = createRouteHandler({
  router: ourFileRouter,
});

async function requireUploadAccess(): Promise<Response | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(request: NextRequest): Promise<Response> {
  const denied = await requireUploadAccess();
  if (denied) return denied;
  return uploadHandler.GET(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  const denied = await requireUploadAccess();
  if (denied) return denied;
  return uploadHandler.POST(request);
}
