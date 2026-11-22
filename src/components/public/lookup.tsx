"use client";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export function RegistrationLookup() {
  const [value, setValue] = useState(""); const [notice, setNotice] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function check() { if (!value.trim()) { window.location.href = "/register"; return; } setLoading(true); setNotice(null); const response = await fetch(`/api/registration/lookup?q=${encodeURIComponent(value)}`); const result = await response.json(); setLoading(false); if (result.state === "registered") setNotice("A registration already exists for these details. Please use your confirmation email or contact the conference team."); else window.location.href = `/register?lookup=${encodeURIComponent(value)}`; }
  return <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur"><div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-w-0 flex-1 items-center gap-2 px-3"><Search size={18} className="text-gold"/><input value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-white/50" placeholder="Email or phone (optional)" aria-label="Email or phone"/></label><button onClick={check} disabled={loading} className="button-primary whitespace-nowrap">{loading ? "Checking…" : <>Continue <ArrowRight size={16}/></>}</button></div>{notice && <p className="px-3 pb-2 text-sm text-amber-200">{notice}</p>}<p className="px-3 pb-1 text-xs text-white/55">Already registered? We&apos;ll help protect your record. Or leave this blank to start fresh.</p></div>;
}
