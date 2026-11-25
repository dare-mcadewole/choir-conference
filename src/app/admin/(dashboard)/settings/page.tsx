import * as conferenceService from "@/features/conference/service";
import { SettingsForm } from "./components/settings-form";

export default async function SettingsPage() {
  const settings = await conferenceService.findOne();

  return (
    <>
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Manage event information, attendee contact details, and registration
          behavior.
        </p>
      </header>

      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <section className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">
            Conference settings are unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Seed the conference defaults before editing settings.
          </p>
        </section>
      )}
    </>
  );
}
