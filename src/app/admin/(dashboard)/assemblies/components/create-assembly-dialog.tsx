"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { slugifyName } from "@/features/shared/utils/slug";
import { createAssemblyAction } from "../actions";

export function CreateAssemblyDialog() {
  const [state, action, pending] = useActionState(createAssemblyAction, null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const slug = slugifyName(name, 180);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setName("");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          if (nextOpen) setName("");
          setOpen(nextOpen);
        }}
      >
        <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800">
          <Plus size={15} />
          New assembly
        </DialogTrigger>
        <DialogContent
          className="max-w-md gap-0 overflow-hidden p-0"
          aria-describedby="create-assembly-description"
        >
          <form action={action}>
            <DialogHeader className="px-5 pb-4 pt-5 pr-12">
              <DialogTitle>Add an assembly</DialogTitle>
              <DialogDescription id="create-assembly-description">
                Create an active assembly for conference registrations and
                family assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 px-5 pb-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Assembly name
                </span>
                <Input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  maxLength={160}
                  required
                  disabled={pending}
                  placeholder="e.g. Grace Notes Choir"
                  className="h-10 rounded-lg text-sm"
                />
              </label>
              <p className="text-[11px] text-slate-500" aria-live="polite">
                Slug:{" "}
                <span className="font-mono text-slate-700">
                  {slug || "Generated from the assembly name"}
                </span>
              </p>
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
                variant="secondary"
                disabled={pending}
                loading={pending}
                loadingText="Creating..."
                className="normal-case tracking-normal"
              >
                Create assembly
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
