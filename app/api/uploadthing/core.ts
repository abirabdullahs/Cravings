import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError({
      code: "FORBIDDEN",
      message: "You must be signed in to upload files",
    });
  }

  return { userId: String(session.user.id) };
}

export const ourFileRouter = {
  profilePicture: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(requireAuthenticatedUser)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  restaurantImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(requireAuthenticatedUser)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  menuItemImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(requireAuthenticatedUser)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
