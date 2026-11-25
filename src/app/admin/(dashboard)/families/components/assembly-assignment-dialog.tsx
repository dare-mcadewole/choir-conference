"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Check, ListChecks, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AssemblyOption } from "@/features/family/service";
import { updateFamilyAssembliesAction } from "../actions";

export function AssemblyAssignmentDialog({
  familyId,
  availableAssemblies,
  assignedAssemblies,
}: {
  familyId: string;
  availableAssemblies: AssemblyOption[];
  assignedAssemblies: AssemblyOption[];
}) {
  const [state, action, pending] = useActionState(
    updateFamilyAssembliesAction,
    null,
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    assignedAssemblies.map((assembly) => assembly.id),
  );
  const assemblies = useMemo(() => {
    const assembliesById = new Map(
      assignedAssemblies.map((assembly) => [assembly.id, assembly]),
    );
    availableAssemblies.forEach((assembly) =>
      assembliesById.set(assembly.id, assembly),
    );
    return [...assembliesById.values()].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [assignedAssemblies, availableAssemblies]);
  const assignedIds = useMemo(
    () => new Set(assignedAssemblies.map((assembly) => assembly.id)),
    [assignedAssemblies],
  );
  const filteredAssemblies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? assemblies.filter((assembly) =>
          assembly.name.toLowerCase().includes(query),
        )
      : assemblies;
  }, [assemblies, search]);

  useEffect(() => {
    if (state?.success) {
      setSearch("");
      setOpen(false);
    }
  }, [state]);

  const hasChanges =
    selectedIds.length !== assignedIds.size ||
    selectedIds.some((assemblyId) => !assignedIds.has(assemblyId));

  function toggleAssembly(assemblyId: string) {
    setSelectedIds((current) =>
      current.includes(assemblyId)
        ? current.filter((id) => id !== assemblyId)
        : [...current, assemblyId],
    );
  }

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          if (nextOpen) {
            setSelectedIds(assignedAssemblies.map((assembly) => assembly.id));
            setSearch("");
          }
          setOpen(nextOpen);
        }}
      >
        <DialogTrigger
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold tracking-wide text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ListChecks size={13} />
          EDIT ASSEMBLY LIST
        </DialogTrigger>
        <DialogContent
          className="max-w-lg gap-0 overflow-hidden p-0"
          aria-describedby={`assembly-dialog-description-${familyId}`}
        >
          <form action={action}>
            <input type="hidden" name="familyId" value={familyId} />
            {selectedIds.map((assemblyId) => (
              <input
                key={assemblyId}
                type="hidden"
                name="assemblyIds"
                value={assemblyId}
              />
            ))}

            <DialogHeader className="px-5 pb-4 pt-5 pr-12">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Edit family assemblies
              </DialogTitle>
              <DialogDescription
                id={`assembly-dialog-description-${familyId}`}
                className="text-xs leading-5"
              >
                Select assemblies to keep assigned. Clear selected assemblies
                to remove them.
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 pb-4">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-[#7778e8] focus-within:ring-2 focus-within:ring-[#7778e8]/15">
                <Search size={15} className="shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  placeholder="Search assemblies"
                  aria-label="Search assemblies"
                  disabled={pending}
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div
                role="group"
                aria-label="Assemblies"
                className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-100"
              >
                {filteredAssemblies.length ? (
                  filteredAssemblies.map((assembly) => {
                    const selected = selectedIds.includes(assembly.id);
                    return (
                      <label
                        key={assembly.id}
                        className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#7778e8]/40 ${
                          selected ? "bg-[#f5f5ff]" : "bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleAssembly(assembly.id)}
                          disabled={pending}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`grid size-4 shrink-0 place-items-center rounded border ${
                            selected
                              ? "border-[#7778e8] bg-[#7778e8] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                          {assembly.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {selected
                            ? assignedIds.has(assembly.id)
                              ? "Assigned"
                              : "Will add"
                            : assignedIds.has(assembly.id)
                              ? "Will remove"
                              : "Not assigned"}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-3 py-8 text-center text-xs text-slate-500">
                    No assemblies match your search.
                  </p>
                )}
              </div>

              <p className="mt-2 text-[11px] text-slate-500" aria-live="polite">
                {selectedIds.length} assigned after saving
              </p>
              {state?.error && (
                <p role="alert" className="mt-2 text-xs text-rose-600">
                  {state.error}
                </p>
              )}
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-b-xl px-5 py-4 sm:flex-row">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="normal-case tracking-normal"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={pending || !hasChanges}
                loading={pending}
                loadingText="Saving..."
                className="normal-case tracking-normal"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {state?.success && (
        <p role="status" className="mt-2 text-[11px] text-emerald-700">
          {state.success}
        </p>
      )}
    </div>
  );
}
