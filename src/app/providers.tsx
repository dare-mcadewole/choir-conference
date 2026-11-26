"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      color="var(--primary)"
      height="3px"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
      <Toaster position="top-right" richColors />
    </ProgressProvider>
  );
}
