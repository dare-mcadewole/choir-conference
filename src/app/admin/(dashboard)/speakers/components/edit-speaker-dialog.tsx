"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { AdminSpeaker } from "@/features/speaker/service";
import { updateSpeakerAction } from "../actions";

export function EditSpeakerDialog({ speaker }: { speaker: AdminSpeaker }) {
  const [state, action, pending] = useActionState(updateSpeakerAction, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
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
          if (!pending) setOpen(nextOpen);
        }}
      >
        <DialogTrigger
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold tracking-wide text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8] disabled:cursor-not-allowed disabled:opacity-60 uppercase"
        >
          <Pencil size={12} />
          Edit speaker
        </DialogTrigger>

        <DialogContent
          className="md:min-w-[640px] max-w-4xl gap-0 overflow-hidden p-0"
          aria-describedby={`edit-speaker-description-${speaker.id}`}
        >
          <form action={action}>
            <input type="hidden" name="id" value={speaker.id} />
            <DialogHeader className="px-5 pb-4 pt-5 pr-12">
              <DialogTitle>Edit speaker</DialogTitle>
              <DialogDescription id={`edit-speaker-description-${speaker.id}`}>
                Update profile details, publication status, and display order.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 pb-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Full name
                  </span>
                  <Input
                    name="fullName"
                    defaultValue={speaker.fullName}
                    maxLength={160}
                    required
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Designation
                  </span>
                  <Input
                    name="designation"
                    defaultValue={speaker.designation ?? ""}
                    maxLength={160}
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Organization
                  </span>
                  <Input
                    name="organization"
                    defaultValue={speaker.organization ?? ""}
                    maxLength={160}
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Image URL
                  </span>
                  <Input
                    name="imageUrl"
                    type="url"
                    defaultValue={speaker.imageUrl ?? ""}
                    maxLength={2048}
                    placeholder="https://example.com/speaker.jpg"
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Biography
                  </span>
                  <Textarea
                    name="biography"
                    defaultValue={speaker.biography ?? ""}
                    maxLength={10000}
                    rows={4}
                    disabled={pending}
                    className="min-h-28 rounded-lg text-xs"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Public image CSS classes
                  </span>
                  <Textarea
                    name="htmlClassName"
                    defaultValue={speaker.htmlClassName ?? ""}
                    maxLength={2000}
                    rows={2}
                    disabled={pending}
                    className="min-h-20 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Display order
                  </span>
                  <Input
                    name="sortOrder"
                    type="number"
                    min={0}
                    max={100000}
                    step={1}
                    defaultValue={speaker.sortOrder}
                    required
                    disabled={pending}
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="flex items-center gap-2 self-end pb-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    name="published"
                    value="true"
                    defaultChecked={speaker.published}
                    disabled={pending}
                    className="size-4 accent-[#7778e8]"
                  />
                  Published on the public page
                </label>
              </div>

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
    </div>
  );
}
