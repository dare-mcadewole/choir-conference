"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLoginForm({
  authConfigured,
  initialMessage,
}: {
  authConfigured: boolean;
  initialMessage: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authConfigured) return;

    setPending(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-slate-700">
          Email address
        </span>
        <Input
          type="email"
          name="email"
          autoComplete="username"
          placeholder="you@conference.org"
          required
          disabled={!authConfigured || pending}
          className="h-12 rounded-xl border-slate-200 bg-white px-4"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-slate-700">
          Password
        </span>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          disabled={!authConfigured || pending}
          className="h-12 rounded-xl border-slate-200 bg-white px-4"
        />
      </label>
      <Button
        type="submit"
        loading={pending}
        loadingText="Signing in..."
        disabled={!authConfigured}
        className="w-full bg-slate-900 hover:bg-slate-800"
      >
        Sign in <ArrowRight size={16} />
      </Button>
      {message && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
        >
          {message}
        </p>
      )}
    </form>
  );
}
