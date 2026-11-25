"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { slugifyName } from "@/features/shared/utils/slug";
import type { FamilySummary } from "@/features/family/service";
import { updateFamilyDetailsAction } from "../actions";

export function EditFamilyDialog({ family }: { family: FamilySummary }) {
  const [state, action, pending] = useActionState(
    updateFamilyDetailsAction,
    null,
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(family.name);
  const slug = slugifyName(name, 80);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          if (nextOpen) setName(family.name);
          setOpen(nextOpen);
        }}
      >
        <DialogTrigger
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold tracking-wide text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pencil size={12} />
          EDIT FAMILY
        </DialogTrigger>
        <DialogContent
          className="max-w-xl gap-0 overflow-hidden p-0"
          aria-describedby={`edit-family-description-${family.id}`}
        >
          <form action={action}>
            <input type="hidden" name="familyId" value={family.id} />
            <DialogHeader className="px-5 pb-4 pt-5 pr-12">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Edit family details
              </DialogTitle>
              <DialogDescription
                id={`edit-family-description-${family.id}`}
                className="text-xs leading-5"
              >
                Update the family name and public details.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 pb-5">
              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-700">
                      Name
                    </span>
                    <Input
                      name="name"
                      value={name}
                      onChange={(event) => setName(event.currentTarget.value)}
                      maxLength={80}
                      required
                      disabled={pending}
                      className="h-9 rounded-lg text-xs"
                    />
                  </label>
                  <p
                    className="mt-1 text-[10px] text-slate-400"
                    aria-live="polite"
                  >
                    Slug:{" "}
                    <span className="font-mono text-slate-500">
                      {slug || "Enter a name with letters or numbers"}
                    </span>
                  </p>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Alias
                  </span>
                  <Input
                    name="alias"
                    defaultValue={family.alias ?? ""}
                    maxLength={140}
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    WhatsApp URL
                  </span>
                  <Input
                    name="whatsappUrl"
                    type="url"
                    defaultValue={family.whatsappUrl ?? ""}
                    maxLength={2048}
                    placeholder="https://chat.whatsapp.com/..."
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Description
                </span>
                <Textarea
                  name="description"
                  defaultValue={family.description ?? ""}
                  disabled={pending}
                  rows={3}
                  className="min-h-20 rounded-lg text-xs"
                />
              </label>

              {state?.error && (
                <p role="alert" className="text-xs text-rose-600">
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
                variant="secondary"
                disabled={pending}
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
