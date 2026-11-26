"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConferenceSettings } from "@/features/conference/service";
import { updateConferenceSettingsAction } from "../actions";

const inputClassName =
  "h-10 rounded-lg border-slate-200 text-sm focus-visible:ring-[#7778e8]";

function dateValue(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? "";
}

function SettingToggle({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-100 p-4">
      <span>
        <span className="block text-sm font-medium text-slate-800">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 shrink-0 accent-[#7778e8]"
      />
    </label>
  );
}

export function SettingsForm({ settings }: { settings: ConferenceSettings }) {
  const [state, action, pending] = useActionState(
    updateConferenceSettingsAction,
    null,
  );

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5 max-w-3xl">
      <input type="hidden" name="id" value={settings.id} />

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Event details
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Details shown across the conference experience.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Conference title
            </span>
            <Input
              name="title"
              defaultValue={settings.title}
              maxLength={200}
              required
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Theme
            </span>
            <Input
              name="theme"
              defaultValue={settings.theme}
              maxLength={200}
              required
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Anchor scripture
            </span>
            <Input
              name="anchorScripture"
              defaultValue={settings.anchorScripture}
              maxLength={300}
              required
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Venue
            </span>
            <Input
              name="venue"
              defaultValue={settings.venue ?? ""}
              maxLength={2000}
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Event starts
            </span>
            <Input
              name="eventStartDate"
              type="date"
              defaultValue={dateValue(settings.eventStartDate)}
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Event ends
            </span>
            <Input
              name="eventEndDate"
              type="date"
              defaultValue={dateValue(settings.eventEndDate)}
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Description
            </span>
            <textarea
              name="description"
              defaultValue={settings.description ?? ""}
              maxLength={10000}
              rows={4}
              disabled={pending}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#7778e8] focus:ring-2 focus:ring-[#7778e8]/15 disabled:opacity-60"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Contact details
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Optional contact channels for conference attendees.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Contact email
            </span>
            <Input
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail ?? ""}
              maxLength={255}
              disabled={pending}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-700">
              Contact phone
            </span>
            <Input
              name="contactPhone"
              type="tel"
              defaultValue={settings.contactPhone ?? ""}
              maxLength={40}
              disabled={pending}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Public page
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Control what attendees see on the conference site.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <SettingToggle
            name="showCountdownTimer"
            title="Show countdown timer"
            description="Display a live countdown to the conference on the landing page."
            defaultChecked={settings.showCountdownTimer ?? true}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Registration settings
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Control registration availability and checkout behavior.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <SettingToggle
            name="registrationOpen"
            title="Accept registrations"
            description="Allow new attendees to submit a registration."
            defaultChecked={settings.registrationOpen}
          />
          <SettingToggle
            name="requirePayment"
            title="Require payment"
            description="Send new registrations through the payment checkout."
            defaultChecked={settings.requirePayment}
          />
          <SettingToggle
            name="allowDuplicates"
            title="Allow duplicate attendees"
            description="Permit registrations using an email or phone already on file."
            defaultChecked={settings.allowDuplicates}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={pending}
          loading={pending}
          loadingText="Saving..."
          className="normal-case tracking-normal"
        >
          Save settings
        </Button>
      </div>
    </form>
  );
}
