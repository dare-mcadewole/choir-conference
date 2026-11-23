"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegistrationLookup() {
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!value.trim()) {
      window.location.href = "/register";
      return;
    }
    setLoading(true);
    setNotice(null);
    const response = await fetch(
      `/api/registration/lookup?q=${encodeURIComponent(value)}`,
    );
    const result = await response.json();
    setLoading(false);
    if (result.state === "registered")
      setNotice(
        "A registration already exists for these details. Please use your confirmation email or contact the conference team.",
      );
    else window.location.href = `/register?lookup=${encodeURIComponent(value)}`;
  }

  return (
    <div
      className="
      w-full max-w-md rounded-xl bg-black/25
      p-1.5 mx-auto shadow-2xl shadow-blue-950/30 backdrop-blur-m
    "
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="
          h-14 border-0 bg-white px-4 !text-lg shadow-none
          placeholder:text-zinc-400 placeholder:text-sm tracking-wider ring-1 ring-[#d4ff00]
          focus-visible:ring-1 focus-visible:ring-[#c1e801] font-bold
          rounded-b-none w-full
        "
        placeholder="ENTER YOUR EMAIL OR PHONE NUMBER"
        aria-label="Email or phone"
      />
      <Button
        onClick={check}
        loading={loading}
        loadingText="Checking..."
        disabled={loading}
        size="lg"
        className="
          h-14 w-full bg-[#d4ff00] px-5 text-[#0839d8] border-0 ring-1 ring-[#d4ff00]
          hover:bg-[#ecff78] uppercase text-base rounded-t-none
        "
      >
        Register now{" "}
        <div
          className="
          absolute right-2 top-3 bg-[#0839d8] text-white
          size-8 flex items-center justify-center rounded-full
        "
        >
          <ArrowRight size={18} />
        </div>
      </Button>
      {notice && (
        <p className="px-3 pb-1 pt-3 text-left text-xs leading-5 text-[#fff2bd]">
          {notice}
        </p>
      )}
    </div>
  );
}
