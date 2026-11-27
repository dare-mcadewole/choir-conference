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
import { RegistrationErrorDialog } from "./error-dialog";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Gender, VOCAL_PART_OPTIONS, VocalPart } from "@/db/schema";
import { TicketCard } from "@/features/ticket/components/ticket-card";
import type {
  HistoricalJsonData,
  TicketDetails,
} from "@/features/ticket/types";

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
  institutions: string[];
  levels: Array<Option & { institutionType: "SECONDARY" | "TERTIARY" }>;
  initial?: {
    fullName?: string;
    email?: string;
    phone?: string;
    data?: HistoricalJsonData;
  };
};

const supportTemplate =
  "Hi support, please add my assembly to the choir conference registration site: ";

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
    ticket: TicketDetails | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () => createRegistrationFormSchema(categories),
    [categories],
  );

  const historicalAssemblyId = useMemo(() => {
    const assembly = initial?.data?.assembly;
    if (!assembly) return "";

    const assemblyLocation = assembly.trim().split(" ").pop()?.toLowerCase();
    if (!assemblyLocation) return "";

    return (
      assemblies.find((a) => a.name.toLowerCase().includes(assemblyLocation))
        ?.id ?? ""
    );
  }, [assemblies, initial?.data]);

  const historicalChoirPositionId = useMemo(() => {
    const position = initial?.data?.choir_position?.toLowerCase();
    if (!position || position === "choir member") return "";

    const key = ["choirmaster", "choirmistress"].includes(position)
      ? "choir master"
      : position;

    return positions.find((p) => p.name.toLowerCase().includes(key))?.id ?? "";
  }, [positions, initial?.data]);

  const historicalCategoryId = useMemo(() => {
    const category = initial?.data?.category?.toLowerCase();
    if (!category) return "";

    let key = category;
    if (["secondary school student", "undergraduate"].includes(category)) {
      key = "student";
    } else if (category === "worker") {
      key = "employed";
    }

    return categories.find((c) => c.name.toLowerCase().includes(key))?.id ?? "";
  }, [categories, initial?.data]);

  const {
    control,
    handleSubmit,
    register,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registrationSchema>, unknown, RegistrationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone?.replace(/\D/g, "") ?? "",
      institution: initial?.data?.institution ?? "",
      gender: (initial?.data?.gender?.toUpperCase() ?? "") as Gender,
      ageRange: initial?.data?.ageRange || initial?.data?.age,
      assemblyId: historicalAssemblyId,
      part: (initial?.data?.part?.toUpperCase() ?? "") as VocalPart,
      positionIds: historicalChoirPositionId ? [historicalChoirPositionId] : [],
      categoryId: historicalCategoryId,
    },
    shouldUnregister: true,
  });

  const phoneField = register("phone");
  const categoryId = watch("categoryId");
  const institution = watch("institution");
  const category = categories.find((item) => item.id === categoryId);
  const isStudent = category?.slug === "student";

  const filteredInstitutions = useMemo(() => {
    const search = institution?.toLowerCase() ?? "";
    return institutions
      .filter((i) => i.toLowerCase().indexOf(search) !== -1)
      .slice(0, 8);
  }, [institutions, institution]);

  if (!assemblies.length)
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <strong>Registration setup is in progress.</strong>
        <p className="mt-2 text-sm">
          No active assemblies are currently assigned to a family for this
          conference. Please check back shortly.
        </p>
      </div>
    );

  if (success) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle2
            className="mx-auto text-secondary-600"
            size={80}
            strokeWidth={0.75}
          />
          <h2 className="mt-4 font-display text-3xl">
            You&apos;re Registered!
          </h2>
          <p className="mt-0.5 text-slate-600">
            {success.requiresPayment
              ? "Your registration is awaiting payment. We’ll take you to secure checkout next."
              : "Your digital ticket is ready"}
          </p>
        </div>
        {success.ticket && <TicketCard ticket={success.ticket} />}
      </div>
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    const response = await submitRegistration(data);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    if (response.checkoutUrl) {
      window.location.assign(response.checkoutUrl);
      return;
    }
    setSuccess(response);
  });

  const supportContact = process.env.NEXT_PUBLIC_SUPPORT_CONTACT;

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="space-y-7">
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
            <Input
              {...phoneField}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(event) => {
                event.currentTarget.value = event.currentTarget.value.replace(
                  /\D/g,
                  "",
                );
                void phoneField.onChange(event);
              }}
              required
            />
          </Field>

          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Field label="Gender" error={errors.gender?.message}>
                <Picker
                  list={["MALE", "FEMALE"]}
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
            name="ageRange"
            render={({ field }) => (
              <Field label="Age Range" error={errors.ageRange?.message}>
                <Picker
                  list={[
                    "15 - 20",
                    "21 - 29",
                    "30 - 39",
                    "40 - 49",
                    "50 and above",
                  ]}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  required
                  placeholder="Select age range"
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="part"
            render={({ field }) => (
              <Field label="Part" error={errors.part?.message}>
                <Picker
                  list={VOCAL_PART_OPTIONS}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  required
                  placeholder="Select your part"
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
                  hint={
                    supportContact && (
                      <span>
                        <a
                          href={`https://wa.me/${supportContact}?text=${supportTemplate}`}
                          target="_blank"
                          className="font-semibold text-primary"
                        >
                          Reach out
                        </a>{" "}
                        if you can't find your assembly.
                      </span>
                    )
                  }
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
                  onValueChange={(value) => {
                    field.onChange(value ?? "");
                    resetField("institution");
                    resetField("academicLevelId");
                  }}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  name={field.name}
                  required
                  placeholder="Select category"
                />
              </Field>
            )}
          />

          {isStudent && (
            <div className="col-span-full rounded-2xl bg-gold/10 p-5">
              <p className="text-sm font-bold text-ink">Student details</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <Controller
                  control={control}
                  name="institution"
                  render={({ field }) => (
                    <Field
                      label="Institution"
                      hint="Enter the institution where you currently study"
                      error={errors.institution?.message}
                    >
                      <Input
                        {...register("institution")}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        list="institutions"
                        required
                      />
                      <datalist id="institutions">
                        {filteredInstitutions.map((institution, ix) => (
                          <option key={institution + ix} value={institution} />
                        ))}
                      </datalist>
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
                        list={levels.map(({ id, name }) => ({
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
                        disabled={!institution}
                        placeholder={
                          institution
                            ? "Select level"
                            : "Enter an institution first"
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
                  label="Position held (Optional)"
                  hint="Select all the positions that apply to you."
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
                  className="grid grid-cols-2 gap-1.5"
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
                    border-[0.5px] px-3.5 py-2 h-10 text-sm font-medium
                  "
                  >
                    <RadioGroupItem value={true} />
                    Yes
                  </label>
                  <label
                    className="
                    flex cursor-pointer items-center gap-2 rounded-md
                    border-[0.5px] px-5 py-2 h-10 text-sm font-medium
                  "
                  >
                    <RadioGroupItem value={false} />
                    No
                  </label>
                </RadioGroup>
              </Field>
            )}
          />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          By registering, you consent to the conference team processing your
          details for the purposes of this event.
        </p>

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
      </form>

      <RegistrationErrorDialog
        error={error}
        onClose={() => setError(null)}
        supportContact={supportContact}
      />
    </>
  );
}
