"use client";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { submitRegistration } from "@/features/registration/actions";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Picker } from "@/components/ui/picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  createRegistrationFormSchema,
  registrationSchema,
  type RegistrationInput,
} from "@/features/registration/validation";
import { Field } from "./field";
import { Input } from "@/components/ui/input";

type Option = {
  id: string;
  name: string;
  slug?: string;
  type?: "SECONDARY" | "TERTIARY";
};
type Props = {
  assemblies: Array<{ id: string; name: string }>;
  categories: Option[];
  positions: Option[];
  institutions: Option[];
  levels: Array<Option & { institutionType: "SECONDARY" | "TERTIARY" }>;
  initial?: { fullName?: string; email?: string; phone?: string };
};

export function RegistrationForm({
  assemblies,
  categories,
  positions,
  institutions,
  levels,
  initial,
}: Props) {
  const [success, setSuccess] = useState<{
    code: string | null;
    requiresPayment: boolean;
  } | null>(null);
  const schema = useMemo(
    () => createRegistrationFormSchema(categories),
    [categories],
  );
  const {
    control,
    clearErrors,
    handleSubmit,
    register,
    resetField,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registrationSchema>, unknown, RegistrationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      positionIds: [],
    },
    shouldUnregister: true,
  });
  const categoryId = watch("categoryId");
  const institutionId = watch("institutionId");
  const category = categories.find((item) => item.id === categoryId);
  const isStudent = category?.slug === "student";
  const institution = institutions.find((item) => item.id === institutionId);
  const matchingLevels = useMemo(
    () => levels.filter((level) => level.institutionType === institution?.type),
    [levels, institution],
  );

  if (!assemblies.length)
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <strong>Registration setup is in progress.</strong>
        <p className="mt-2 text-sm">
          The conference team has not published any active assemblies yet.
          Please check back shortly.
        </p>
      </div>
    );

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
        <h2 className="mt-4 font-display text-3xl">You&apos;re registered.</h2>
        <p className="mt-3 text-slate-600">
          {success.requiresPayment
            ? "Your registration is awaiting payment. We’ll take you to secure checkout next."
            : "Your confirmation and digital ticket are ready."}
        </p>
        {success.code && (
          <a
            className="button-primary mt-6"
            href={`/registration/${success.code}`}
          >
            View confirmation
          </a>
        )}
      </div>
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root.server");
    const response = await submitRegistration(data);
    if (!response.ok) {
      setError("root.server", { type: "server", message: response.error });
      return;
    }
    if (response.checkoutUrl) {
      window.location.assign(response.checkoutUrl);
      return;
    }
    setSuccess(response);
  });

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => clearErrors("root.server")}
      noValidate
      className="space-y-7"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <Input {...register("fullName")} required />
        </Field>

        <Field
          label="Email address"
          hint="We’ll send your registration confirmation to this address."
          error={errors.email?.message}
        >
          <Input {...register("email")} type="email" required />
        </Field>

        <Field label="Phone number" error={errors.phone?.message}>
          <Input {...register("phone")} type="tel" required />
        </Field>

        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Field label="Gender" error={errors.gender?.message}>
              <Picker
                list={[
                  { label: "Male", value: "MALE" },
                  { label: "Female", value: "FEMALE" },
                ]}
                value={field.value ?? null}
                onValueChange={(value) => field.onChange(value ?? "")}
                onBlur={field.onBlur}
                inputRef={field.ref}
                name={field.name}
                required
                placeholder="Select gender"
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="assemblyId"
          render={({ field }) => (
            <Combobox
              items={assemblies}
              value={
                assemblies.find((assembly) => assembly.id === field.value) ??
                null
              }
              onValueChange={(assembly) => field.onChange(assembly?.id ?? "")}
              itemToStringLabel={(assembly) => assembly.name}
              itemToStringValue={(assembly) => assembly.id}
              inputRef={field.ref}
              name={field.name}
              required
              autoHighlight
            >
              <Field
                id="assembly-picker"
                label="Assembly"
                hint="Search by assembly name."
                error={errors.assemblyId?.message}
              >
                <ComboboxInput
                  placeholder="Search assemblies..."
                  onBlur={field.onBlur}
                  showClear
                  className="w-full"
                />
              </Field>
              <ComboboxContent>
                <ComboboxEmpty>No assemblies found.</ComboboxEmpty>
                <ComboboxList>
                  {(assembly: (typeof assemblies)[number]) => (
                    <ComboboxItem key={assembly.id} value={assembly}>
                      {assembly.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}
        />

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Field label="Category" error={errors.categoryId?.message}>
              <Picker
                list={categories.map(({ id, name }) => ({
                  label: name,
                  value: id,
                }))}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                onBlur={field.onBlur}
                inputRef={field.ref}
                name={field.name}
                required
                placeholder="Select category"
              />
            </Field>
          )}
        />
      </div>

      {isStudent && (
        <div className="rounded-2xl bg-gold/10 p-5">
          <p className="text-sm font-bold text-ink">Student details</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="institutionId"
              render={({ field }) => (
                <Field
                  label="Institution"
                  hint="Choose the institution where you currently study."
                  error={errors.institutionId?.message}
                >
                  <Picker
                    list={institutions.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    }))}
                    value={field.value ?? null}
                    onValueChange={(value) => {
                      field.onChange(value ?? undefined);
                      resetField("academicLevelId");
                    }}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    name={field.name}
                    required
                    placeholder="Select institution"
                  />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="academicLevelId"
              render={({ field }) => (
                <Field
                  label="Academic class / level"
                  error={errors.academicLevelId?.message}
                >
                  <Picker
                    list={matchingLevels.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    }))}
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    name={field.name}
                    required
                    disabled={!institutionId}
                    placeholder={
                      institutionId
                        ? "Select level"
                        : "Select an institution first"
                    }
                  />
                </Field>
              )}
            />
          </div>
        </div>
      )}

      <Controller
        control={control}
        name="positionIds"
        render={({ field }) => {
          const selectedPositions = positions.filter((position) =>
            field.value?.includes(position.id),
          );

          return (
            <Field
              label="Position held"
              hint="Search and select all positions that apply to you."
              error={errors.positionIds?.message}
              group
            >
              <Combobox
                items={positions}
                multiple
                value={selectedPositions}
                onValueChange={(selected) =>
                  field.onChange(selected.map((position) => position.id))
                }
                itemToStringLabel={(position) => position.name}
                itemToStringValue={(position) => position.id}
                inputRef={field.ref}
                name={field.name}
                autoHighlight
                onOpenChange={(open, eventDetails) => {
                  if (!open && eventDetails.reason === "item-press") {
                    eventDetails.cancel();
                  }
                }}
              >
                <ComboboxValue>
                  {(selected: (typeof positions)[number][]) => (
                    <ComboboxChips
                      className="w-full"
                      aria-invalid={Boolean(errors.positionIds)}
                    >
                      <>
                        {selected.map((position) => (
                          <ComboboxChip
                            key={position.id}
                            aria-label={position.name}
                          >
                            {position.name}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          aria-label="Search positions"
                          onBlur={field.onBlur}
                          placeholder={
                            selected.length ? "" : "Search positions..."
                          }
                        />
                      </>
                    </ComboboxChips>
                  )}
                </ComboboxValue>
                <ComboboxContent>
                  <ComboboxEmpty>No positions found.</ComboboxEmpty>
                  <ComboboxList>
                    {(position: (typeof positions)[number]) => (
                      <ComboboxItem key={position.id} value={position}>
                        {position.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="centralChoirMember"
        render={({ field }) => (
          <Field
            label="Are you a Central Choir member?"
            error={errors.centralChoirMember?.message}
            group
          >
            <RadioGroup
              className="flex w-fit flex-row gap-1.5"
              value={field.value ?? null}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              name={field.name}
              required
            >
              <label
                className="
                  flex cursor-pointer items-center gap-2 rounded-md
                  border-[0.5px] px-3.5 py-2 h-10 text-sm
                "
              >
                <RadioGroupItem value={true} />
                Yes
              </label>
              <label
                className="
                  flex cursor-pointer items-center gap-2 rounded-md
                  border-[0.5px] px-5 py-2 h-10 text-sm
                "
              >
                <RadioGroupItem value={false} />
                No
              </label>
            </RadioGroup>
          </Field>
        )}
      />

      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {errors.root.server.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isSubmitting}
          size="lg"
          variant="secondary"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          Register Now
        </Button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        By registering, you consent to the conference team processing your
        details for the purposes of this event.
      </p>
    </form>
  );
}
