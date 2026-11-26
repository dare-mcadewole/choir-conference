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
import { Textarea } from "@/components/ui/textarea";
import { createSpeakerAction } from "../actions";

export function CreateSpeakerDialog({
  defaultSortOrder,
}: {
  defaultSortOrder: number;
}) {
  const [state, action, pending] = useActionState(createSpeakerAction, null);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

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
          if (pending) return;
          if (nextOpen) setFormKey((key) => key + 1);
          setOpen(nextOpen);
        }}
      >
        <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800">
          <Plus size={15} />
          New speaker
        </DialogTrigger>

        <DialogContent
          className="md:min-w-[640px] max-w-4xl gap-0 overflow-hidden p-0"
          aria-describedby="create-speaker-description"
        >
          <form key={formKey} action={action}>
            <DialogHeader className="px-5 pb-4 pt-5 pr-12">
              <DialogTitle>Add a speaker</DialogTitle>
              <DialogDescription id="create-speaker-description">
                Create a speaker profile. It stays a draft until you publish it.
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
                    maxLength={160}
                    required
                    disabled={pending}
                    placeholder="e.g. Pastor John Doe"
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Designation
                  </span>
                  <Input
                    name="designation"
                    maxLength={160}
                    disabled={pending}
                    placeholder="e.g. Guest Minister"
                    className="h-9 rounded-lg text-xs"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700">
                    Organization
                  </span>
                  <Input
                    name="organization"
                    maxLength={160}
                    disabled={pending}
                    placeholder="e.g. Grace Chapel"
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
                    defaultValue={defaultSortOrder}
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
                loadingText="Creating..."
                className="normal-case tracking-normal"
              >
                Create speaker
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
