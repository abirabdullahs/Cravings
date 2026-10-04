"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </NextAuthSessionProvider>
    </QueryClientProvider>
  );
}
