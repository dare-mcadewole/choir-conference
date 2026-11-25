import { GraduationCap, UsersRound } from "lucide-react";

type CategoryStatistic = {
  slug: string;
  total: number | string;
};

export function RegistrationCategoryBreakdown({
  categories,
}: {
  categories: CategoryStatistic[];
}) {
  const studentTotal = categories
    .filter((category) => category.slug === "student")
    .reduce((total, category) => total + Number(category.total), 0);
  const nonStudentTotal = categories
    .filter((category) => category.slug !== "student")
    .reduce((total, category) => total + Number(category.total), 0);
  const categorizedTotal = studentTotal + nonStudentTotal;
  const groups = [
    {
      label: "Students",
      total: studentTotal,
      icon: GraduationCap,
      barColor: "bg-slate-500",
    },
    {
      label: "Non-students",
      total: nonStudentTotal,
      icon: UsersRound,
      barColor: "bg-slate-300",
    },
  ];

  return (
    <section className="rounded-lg border-hairline shadow-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div>
        <h2 className="font-display text-2xl text-slate-900">
          Registration categories
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Attendee breakdown by student status
        </p>
      </div>
      <div className="mt-5 grid gap-3">
        {groups.map(({ label, total, icon: Icon, barColor }) => {
          const percentage = categorizedTotal
            ? Math.round((total / categorizedTotal) * 100)
            : 0;

          return (
            <article
              key={label}
              className="rounded-lg border-hairline border-slate-200 bg-slate-50 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      {label}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {percentage}% of categorized attendees
                    </p>
                  </div>
                </div>
                <p className="font-display text-3xl leading-none text-slate-900">
                  {total.toLocaleString()}
                </p>
              </div>
              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label={`${label} share`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
              >
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
