"use client";

import { ProgressProvider } from "@bprogress/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      color="var(--primary)"
      height="3px"
      options={{ showSpinner: false }}
    >
      {children}
    </ProgressProvider>
  );
}
