"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function AdminSearch() {
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(searchValue);

  useEffect(() => {
    setQuery(searchValue);
  }, [searchValue]);

  return (
    <form
      action="/admin"
      method="get"
      role="search"
      className="flex h-11 w-full max-w-md items-center gap-3 rounded-full border border-slate-100 bg-white px-4 shadow-sm"
    >
      <Search size={17} className="shrink-0 text-slate-400" />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search registrations"
        aria-label="Search registrations"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      <kbd className="hidden rounded-md bg-slate-50 px-1.5 py-1 text-[10px] text-slate-400 sm:inline">
        ENTER
      </kbd>
    </form>
  );
}
