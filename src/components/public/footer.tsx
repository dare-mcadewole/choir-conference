import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink py-12 text-slate-300">
      <div className="page-shell flex flex-col justify-between gap-8 md:flex-row">
        <div>
          <p className="font-display text-xl text-white">
            ALL CHOIRS&apos; CONFERENCE 2027
          </p>
          <p className="mt-2 text-sm text-gold">THE ABLE MINISTER</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/register">Registration</Link>
          <Link href="/statistics">Conference statistics</Link>
          <Link href="/admin">Administration</Link>
        </div>
        <p className="text-sm">© 2027 All Choirs&apos; Conference.</p>
      </div>
    </footer>
  );
}
