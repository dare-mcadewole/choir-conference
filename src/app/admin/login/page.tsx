"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Sign-in is unavailable because an authentication provider has not been configured. Your credentials were not sent.",
    );
  }

  return (
    <main className="grid min-h-screen place-items-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-indigo-950/15 lg:min-h-[620px] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-secondary-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-20 top-16 size-72 rounded-full bg-[#7778e8]/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full bg-[#d4ff00]/15 blur-3xl" />
          <Link href="/" className="relative flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Music2 size={20} />
            </span>
            <span className="text-sm font-bold tracking-wide">
              ALL CHOIRS&apos; CONFERENCE
            </span>
          </Link>
          <div className="relative max-w-sm">
            <h1 className="mt-5 text-5xl font-bold text-white">Sign In</h1>
            <p className="mt-3 text-sm leading-6 text-white/75 text-secondary-200">
              Manage registrations, conference information, speakers, tickets,
              and payments from one place.
            </p>
          </div>
          <p className="relative text-xs text-white/75">
            All Choirs&apos; Conference · January 8–9, 2027
          </p>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <Link
            href="/admin"
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#5556c8]"
          >
            <ArrowLeft size={15} /> Back to dashboard
          </Link>

          <div className="mt-12 max-w-md">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eeeefe] text-[#6566d8] lg:hidden">
              <Music2 size={20} />
            </span>

            <h2 className="mt-1 font-display text-3xl uppercase text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Sign in to continue to the conference dashboard.
            </p>

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
                  className="h-12 rounded-xl border-slate-200 bg-white px-4"
                />
              </label>
              <Button
                type="submit"
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

            <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
              Need administrator access? Contact the conference team.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
