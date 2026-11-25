"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import type { AssemblyOption } from "@/features/family/service";
import { addAssemblyToFamilyAction } from "../actions";

export function AssignmentForm({
  familyId,
  assemblies,
  conferenceAvailable,
  activeAssemblyCount,
}: {
  familyId: string;
  assemblies: AssemblyOption[];
  conferenceAvailable: boolean;
  activeAssemblyCount: number;
}) {
  const [state, action, pending] = useActionState(
    addAssemblyToFamilyAction,
    null,
  );

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {!conferenceAvailable ? (
        <p className="text-[11px] text-slate-500">
          Set an active conference before assigning assemblies.
        </p>
      ) : activeAssemblyCount === 0 ? (
        <p className="text-[11px] text-slate-500">
          Add active assemblies before assigning them to families.
        </p>
      ) : assemblies.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          All active assemblies are already assigned to this family.
        </p>
      ) : (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="familyId" value={familyId} />
          <label className="sr-only" htmlFor={`assembly-${familyId}`}>
            Add an assembly to this family
          </label>
          <select
            id={`assembly-${familyId}`}
            name="assemblyId"
            defaultValue=""
            required
            disabled={pending}
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-[#7778e8] focus:ring-2 focus:ring-[#7778e8]/15 disabled:opacity-60"
          >
            <option value="" disabled>
              Select an assembly
            </option>
            {assemblies.map((assembly) => (
              <option key={assembly.id} value={assembly.id}>
                {assembly.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#171923] px-3 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </button>
        </form>
      )}
      {state?.error && (
        <p role="alert" className="mt-2 text-[11px] text-rose-600">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="mt-2 text-[11px] text-emerald-700">
          {state.success}
        </p>
      )}
    </div>
  );
}
