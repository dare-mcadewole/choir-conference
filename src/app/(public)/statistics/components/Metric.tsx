export default function Metric({
  icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div
      className="
        relative overflow-hidden rounded-lg  bg-white p-5
        shadow-2xl shadow-primary/5 sm:p-6
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-8 size-24 rounded-full bg-slate-50"
      />
      <div
        className={`relative grid size-11 place-items-center rounded-2xl ${iconClassName}`}
      >
        {icon}
      </div>
      <h3 className="relative mt-6 font-display text-4xl text-slate-900">
        {value}
      </h3>
      <p className="relative uppercase text-sm text-slate-400 tracking-wider">
        {label}
      </p>
    </div>
  );
}
