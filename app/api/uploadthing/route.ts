import { NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { auth } from "@/auth";

import { ourFileRouter } from "./core";

const uploadHandler = createRouteHandler({
  router: ourFileRouter,
});

async function requireUploadAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, response: null };
}

export async function GET(request: Request) {
  const access = await requireUploadAccess();
  if (!access.ok) return access.response;
  return uploadHandler.GET(request);
}

export async function POST(request: Request) {
  const access = await requireUploadAccess();
  if (!access.ok) return access.response;
  return uploadHandler.POST(request);
}
