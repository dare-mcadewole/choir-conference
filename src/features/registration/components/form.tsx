"use client";
import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { submitRegistration } from "@/features/registration/actions";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
  slug?: string;
  type?: "SECONDARY" | "TERTIARY";
};
type Props = {
  assemblies: Array<{ id: string; name: string; familyName: string | null }>;
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    code: string | null;
    requiresPayment: boolean;
  } | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [institutionId, setInstitutionId] = useState("");
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

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const central = form.get("centralChoirMember") === "true";
    const data = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      gender: form.get("gender"),
      assemblyId: form.get("assemblyId"),
      categoryId: form.get("categoryId"),
      positionIds: form.getAll("positionIds"),
      centralChoirMember: central,
      institutionId: isStudent
        ? form.get("institutionId") || undefined
        : undefined,
      academicLevelId: isStudent
        ? form.get("academicLevelId") || undefined
        : undefined,
    };

    startTransition(async () => {
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
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name">
          <input
            className="field"
            name="fullName"
            defaultValue={initial?.fullName}
            required
          />
        </Field>

        <Field label="Email address">
          <input
            className="field"
            name="email"
            type="email"
            defaultValue={initial?.email}
            required
          />
        </Field>

        <Field label="Phone number">
          <input
            className="field"
            name="phone"
            type="tel"
            defaultValue={initial?.phone}
            required
          />
        </Field>

        <Field label="Gender">
          <select name="gender" className="field" required defaultValue="">
            <option value="" disabled>
              Select gender
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </Field>

        <Field label="Assembly">
          <select name="assemblyId" className="field" required defaultValue="">
            <option value="" disabled>
              Select your assembly
            </option>
            {assemblies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.familyName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select
            name="categoryId"
            className="field"
            required
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setInstitutionId("");
            }}
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

      <Field label="Position held (select all that apply)">
        <div className="grid gap-3 sm:grid-cols-2">
          {positions.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"
            >
              <input name="positionIds" type="checkbox" value={item.id} />
              {item.name}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Are you a Central Choir member?">
        <div className="flex gap-3">
          <label className="rounded-xl border px-5 py-3 text-sm">
            <input
              className="mr-2"
              name="centralChoirMember"
              type="radio"
              value="true"
              required
            />
            Yes
          </label>
          <label className="rounded-xl border px-5 py-3 text-sm">
            <input
              className="mr-2"
              name="centralChoirMember"
              type="radio"
              value="false"
              required
            />
            No
          </label>
        </div>
      </Field>

      {isStudent && (
        <div className="rounded-2xl bg-gold/10 p-5">
          <p className="text-sm font-bold text-ink">Student details</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <Field label="Institution">
              <select
                name="institutionId"
                className="field"
                required
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
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
            <Field label="Academic class / level">
              <select
                name="academicLevelId"
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

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      <Button
        type="submit"
        loading={isPending}
        className="w-full md:w-auto"
        disabled={isPending}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}
