"use client";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { submitRegistration } from "@/features/registration/actions";
import { Button } from "@/components/ui/button";
import {
  createRegistrationFormSchema,
  registrationSchema,
  type RegistrationInput,
} from "@/features/registration/validation";
import { Field } from "./field";

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
  } = useForm<
    z.input<typeof registrationSchema>,
    unknown,
    RegistrationInput
  >({
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
          <input
            {...register("fullName")}
            className="field"
            required
          />
        </Field>

        <Field
          label="Email address"
          hint="We’ll send your registration confirmation to this address."
          error={errors.email?.message}
        >
          <input
            {...register("email")}
            className="field"
            type="email"
            required
          />
        </Field>

        <Field
          label="Phone number"
          hint="Use the number associated with your registration."
          error={errors.phone?.message}
        >
          <input
            {...register("phone")}
            className="field"
            type="tel"
            required
          />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <select
            {...register("gender")}
            className="field"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </Field>

        <Field label="Assembly" error={errors.assemblyId?.message}>
          <select
            {...register("assemblyId")}
            className="field"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select your assembly
            </option>
            {assemblies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category" error={errors.categoryId?.message}>
          <select
            {...register("categoryId")}
            className="field"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Position held (select all that apply)"
        hint="Choose all positions that apply to you."
        error={errors.positionIds?.message}
        group
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {positions.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"
            >
              <input
                {...register("positionIds")}
                type="checkbox"
                value={item.id}
              />
              {item.name}
            </label>
          ))}
        </div>
      </Field>

      <Field
        label="Are you a Central Choir member?"
        error={errors.centralChoirMember?.message}
        group
      >
        <div className="flex gap-3">
          <Controller
            control={control}
            name="centralChoirMember"
            render={({ field }) => (
              <>
                <label className="rounded-xl border px-5 py-3 text-sm">
                  <input
                    ref={field.ref}
                    className="mr-2"
                    name={field.name}
                    type="radio"
                    value="true"
                    checked={field.value === true}
                    onBlur={field.onBlur}
                    onChange={() => field.onChange(true)}
                    required
                  />
                  Yes
                </label>
                <label className="rounded-xl border px-5 py-3 text-sm">
                  <input
                    className="mr-2"
                    name={field.name}
                    type="radio"
                    value="false"
                    checked={field.value === false}
                    onBlur={field.onBlur}
                    onChange={() => field.onChange(false)}
                    required
                  />
                  No
                </label>
              </>
            )}
          />
        </div>
      </Field>

      {isStudent && (
        <div className="rounded-2xl bg-gold/10 p-5">
          <p className="text-sm font-bold text-ink">Student details</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <Field
              label="Institution"
              hint="Choose the institution where you currently study."
              error={errors.institutionId?.message}
            >
              <select
                {...register("institutionId", {
                  setValueAs: (value: string) => value || undefined,
                  onChange: () => resetField("academicLevelId"),
                })}
                className="field"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select institution
                </option>
                {institutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Academic class / level"
              error={errors.academicLevelId?.message}
            >
              <select
                {...register("academicLevelId", {
                  setValueAs: (value: string) => value || undefined,
                })}
                className="field"
                required
                disabled={!institutionId}
                defaultValue=""
              >
                <option value="" disabled>
                  {institutionId
                    ? "Select level"
                    : "Select an institution first"}
                </option>
                {matchingLevels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {errors.root?.server?.message && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errors.root.server.message}
        </p>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        className="w-full md:w-auto"
        disabled={isSubmitting}
      >
        Complete registration
      </Button>

      <p className="text-xs leading-5 text-slate-500">
        By registering, you consent to the conference team processing your
        details for the purposes of this event.
      </p>
    </form>
  );
}
