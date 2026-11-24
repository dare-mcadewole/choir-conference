export function RegistrationStatus({ status }: { status: string }) {
  const confirmed = status === "CONFIRMED";
  const pending = status === "PENDING_PAYMENT";
  const label = confirmed
    ? "Confirmed"
    : pending
      ? "Pending"
      : status === "CANCELLED"
        ? "Cancelled"
        : "Expired";
  const color = confirmed
    ? "bg-emerald-50 text-emerald-700"
    : pending
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${color}`}
    >
      {label}
    </span>
  );
}
