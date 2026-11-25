"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  AdminRegistrationOptions,
  AdminRegistrationSummary,
} from "@/features/registration/service";
import { VOCAL_PART_OPTIONS } from "@/features/registration/schema";
import { updateRegistrationAction } from "../actions";

const selectClassName =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-[#7778e8] focus:ring-2 focus:ring-[#7778e8]/15 disabled:opacity-60";

export function EditRegistrationDialog({
  registration,
  options,
  onClose,
  onSuccess,
}: {
  registration: AdminRegistrationSummary;
  options: AdminRegistrationOptions;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [state, action, pending] = useActionState(
    updateRegistrationAction,
    null,
  );
  const [categoryId, setCategoryId] = useState(registration.categoryId);
  const selectedCategory = options.categories.find(
    (category) => category.id === categoryId,
  );
  const isStudent = selectedCategory?.slug === "student";

  useEffect(() => {
    if (state?.success) {
      onSuccess(state.success);
      onClose();
    }
  }, [onClose, onSuccess, state]);

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!pending && !nextOpen) onClose();
      }}
    >
      <DialogContent
        className="max-w-2xl gap-0 overflow-hidden p-0"
        aria-describedby={`edit-registration-description-${registration.id}`}
      >
        <form action={action}>
          <input type="hidden" name="registrationId" value={registration.id} />
          <DialogHeader className="px-5 pb-4 pt-5 pr-12">
            <DialogTitle>Edit registration</DialogTitle>
            <DialogDescription
              id={`edit-registration-description-${registration.id}`}
            >
              Update attendee and registration details. Payment, ticket, and
              registration status are not changed.
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
                  defaultValue={registration.fullName}
                  maxLength={200}
                  required
                  disabled={pending}
                  className="h-9 rounded-lg text-xs"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Email
                </span>
                <Input
                  name="email"
                  type="email"
                  defaultValue={registration.email}
                  maxLength={255}
                  required
                  disabled={pending}
                  className="h-9 rounded-lg text-xs"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Phone
                </span>
                <Input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={registration.phone.replace(/\D/g, "")}
                  maxLength={11}
                  required
                  disabled={pending}
                  className="h-9 rounded-lg text-xs"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Gender
                </span>
                <select
                  name="gender"
                  defaultValue={registration.gender}
                  required
                  disabled={pending}
                  className={selectClassName}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Assembly
                </span>
                <select
                  name="assemblyId"
                  defaultValue={registration.assemblyId}
                  required
                  disabled={pending}
                  className={selectClassName}
                >
                  {options.assemblies.map((assembly) => (
                    <option key={assembly.id} value={assembly.id}>
                      {assembly.name}
                      {!assembly.active ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Category
                </span>
                <select
                  name="categoryId"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.currentTarget.value)}
                  required
                  disabled={pending}
                  className={selectClassName}
                >
                  {options.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {!category.active ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Vocal part
                </span>
                <select
                  name="part"
                  defaultValue={registration.part}
                  required
                  disabled={pending}
                  className={selectClassName}
                >
                  {VOCAL_PART_OPTIONS.map((part) => (
                    <option key={part} value={part}>
                      {part[0] + part.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  Central Choir member
                </span>
                <select
                  name="centralChoirMember"
                  defaultValue={String(
                    registration.centralChoirMember ?? false,
                  )}
                  required
                  disabled={pending}
                  className={selectClassName}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            </div>

            {isStudent && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Student details
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-700">
                      Institution
                    </span>
                    <Input
                      name="institution"
                      defaultValue={registration.institution ?? ""}
                      list={`institutions-${registration.id}`}
                      maxLength={360}
                      required
                      disabled={pending}
                      className="h-9 rounded-lg text-xs"
                    />
                    <datalist id={`institutions-${registration.id}`}>
                      {options.institutions.map((institution, index) => (
                        <option
                          key={`${institution}-${index}`}
                          value={institution}
                        />
                      ))}
                    </datalist>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-700">
                      Academic level
                    </span>
                    <select
                      name="academicLevelId"
                      defaultValue={registration.academicLevelId ?? ""}
                      required
                      disabled={pending}
                      className={selectClassName}
                    >
                      <option value="" disabled>
                        Select level
                      </option>
                      {options.levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                          {!level.active ? " (inactive)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            <fieldset className="rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-semibold text-slate-700">
                Positions
              </legend>
              {options.positions.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.positions.map((position) => (
                    <label
                      key={position.id}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <input
                        type="checkbox"
                        name="positionIds"
                        value={position.id}
                        defaultChecked={registration.positions.some(
                          (current) => current.id === position.id,
                        )}
                        disabled={pending}
                        className="size-4 accent-[#7778e8]"
                      />
                      <span>
                        {position.name}
                        {!position.active ? " (inactive)" : ""}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No positions are configured.
                </p>
              )}
            </fieldset>

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
  );
}
