import { AssemblyAssignmentDialog } from "./assembly-assignment-dialog";
import type { AssemblyOption } from "@/features/family/service";

export function AssignmentForm({
  familyId,
  availableAssemblies,
  assignedAssemblies,
  conferenceAvailable,
  activeAssemblyCount,
}: {
  familyId: string;
  availableAssemblies: AssemblyOption[];
  assignedAssemblies: AssemblyOption[];
  conferenceAvailable: boolean;
  activeAssemblyCount: number;
}) {
  return (
    !conferenceAvailable ? (
      <p className="text-[11px] text-slate-500">
        Set an active conference before assigning assemblies.
      </p>
    ) : activeAssemblyCount === 0 && assignedAssemblies.length === 0 ? (
      <p className="text-[11px] text-slate-500">
        Add active assemblies before assigning them to families.
      </p>
    ) : (
      <AssemblyAssignmentDialog
        familyId={familyId}
        availableAssemblies={availableAssemblies}
        assignedAssemblies={assignedAssemblies}
      />
    )
  );
}
