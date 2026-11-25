import {
  AudioLines,
  Building2,
  ExternalLink,
  Music,
  Music2,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AssemblyOption, FamilySummary } from "@/features/family/service";
import { AssignmentForm } from "./assignment-form";
import { EditFamilyDialog } from "./edit-family-dialog";

const familyIcons: Record<string, LucideIcon> = {
  AudioLines,
  Music,
  Music2,
  Users,
};

export function FamilyCard({
  family,
  availableAssemblies,
  assignedAssemblies,
  conferenceAvailable,
  activeAssemblyCount,
}: {
  family: FamilySummary;
  availableAssemblies: AssemblyOption[];
  assignedAssemblies: AssemblyOption[];
  conferenceAvailable: boolean;
  activeAssemblyCount: number;
}) {
  const Icon = familyIcons[family.icon] ?? UsersRound;
  const visibleAssemblies = family.assemblyNames.slice(0, 3);
  const remainingAssemblies =
    family.assemblyNames.length - visibleAssemblies.length;

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-[#fbfcff] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eeeefe] text-[#7778e8]">
            <Icon size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {family.name}
            </h3>
            {family.alias && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {family.alias}
              </p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
            family.active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {family.active ? "Active" : "Inactive"}
        </span>
      </div>

      {family.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
          {family.description}
        </p>
      )}

      <div className="mt-3 flex min-w-0 items-start gap-2 border-t border-slate-100 pt-3">
        <Building2 size={14} className="mt-0.5 shrink-0 text-slate-400" />
        <span className="shrink-0 text-[10px] font-semibold text-slate-500">
          {family.assemblyCount}
        </span>
        {family.assemblyNames.length ? (
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {visibleAssemblies.map((name) => (
              <span
                key={name}
                className="max-w-full truncate rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600"
              >
                {name}
              </span>
            ))}
            {remainingAssemblies > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                +{remainingAssemblies}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">No assemblies assigned</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            {Number(family.registrationCount).toLocaleString()}
          </span>{" "}
          registrations
        </p>
        {family.whatsappUrl ? (
          <a
            href={family.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f0f0ff] px-2.5 py-1.5 text-[10px] font-semibold text-[#5556c8] hover:bg-[#e6e6ff]"
          >
            WhatsApp <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-[10px] text-slate-400">No group link</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <EditFamilyDialog family={family} />

        <AssignmentForm
          familyId={family.id}
          availableAssemblies={availableAssemblies}
          assignedAssemblies={assignedAssemblies}
          conferenceAvailable={conferenceAvailable}
          activeAssemblyCount={activeAssemblyCount}
        />
      </div>
    </article>
  );
}
