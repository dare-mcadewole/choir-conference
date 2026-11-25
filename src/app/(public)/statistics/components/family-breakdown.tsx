import { UserRoundGroup, Users, UsersRound } from "lucide-react";

type FamilyStatistic = {
  name: string;
  total: number | string;
};

export function FamilyBreakdown({
  families,
  total,
}: {
  families: FamilyStatistic[];
  total: number | string;
}) {
  const confirmedTotal = Number(total);

  return (
    <section className="rounded-lg border-hairline shadow-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center gap-2 text-secondary-700">
        <UserRoundGroup size={20} strokeWidth={1.95} />
        <h2 className="text-lg font-medium">By Family / Group</h2>
      </div>

      <div className="mt-5 space-y-4">
        {families.map((family) => {
          const familyTotal = Number(family.total);
          const percentage = confirmedTotal
            ? Math.min(100, Math.round((familyTotal / confirmedTotal) * 100))
            : 0;

          return (
            <div key={family.name}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">
                  {family.name}
                </span>
                <strong className="text-slate-800">{family.total}</strong>
              </div>
              <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-300 transition-[width]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {!families.length && (
          <p className="py-8 text-center text-sm text-slate-500">
            Statistics will appear as registrations are confirmed.
          </p>
        )}
      </div>
    </section>
  );
}
