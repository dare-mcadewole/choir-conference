"use client";

import { useCallback, useState } from "react";
import { Pencil, UserRound } from "lucide-react";
import { RegistrationStatus } from "@/app/admin/_components/registration-status";
import { getInitials } from "@/features/shared/utils/strings";
import type {
  AdminRegistrationOptions,
  AdminRegistrationSummary,
} from "@/features/registration/service";
import { EditRegistrationDialog } from "./edit-registration-dialog";

export function RegistrationDirectory({
  registrations,
  options,
}: {
  registrations: AdminRegistrationSummary[];
  options: AdminRegistrationOptions;
}) {
  const [selectedRegistration, setSelectedRegistration] =
    useState<AdminRegistrationSummary | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const closeDialog = useCallback(() => setSelectedRegistration(null), []);

  return (
    <div>
      {successMessage && (
        <p
          role="status"
          className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
        >
          {successMessage}
        </p>
      )}
      <div className="divide-y divide-slate-100">
        {registrations.map((registration) => (
          <article
            key={registration.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eeeefe] text-xs font-semibold text-[#7778e8]">
                {getInitials(registration.fullName) || <UserRound size={16} />}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="max-w-full truncate text-sm font-semibold text-slate-800">
                    {registration.fullName}
                  </h3>
                  <RegistrationStatus status={registration.status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {registration.email} · {registration.phone}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-400">
                  {registration.assemblyName ?? "Assembly unavailable"}
                  {" · "}
                  {registration.categoryName ?? "Category unavailable"}
                  {" · "}
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(registration.createdAt)}
                </p>
                {registration.registrationCode && (
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Ref: {registration.registrationCode}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                setSelectedRegistration(registration);
              }}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold tracking-wide text-slate-700 transition hover:border-[#c5c6ff] hover:text-[#5556c8] sm:self-auto"
            >
              <Pencil size={12} />
              Edit
            </button>
          </article>
        ))}
      </div>
      {selectedRegistration && (
        <EditRegistrationDialog
          key={selectedRegistration.id}
          registration={selectedRegistration}
          options={options}
          onClose={closeDialog}
          onSuccess={setSuccessMessage}
        />
      )}
    </div>
  );
}
