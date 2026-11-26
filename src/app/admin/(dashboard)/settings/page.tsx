import * as conferenceService from "@/features/conference/service";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { SettingsForm } from "./components/settings-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Settings",
  description:
    "Manage conference settings and registration behavior.",
});

export default async function SettingsPage() {
  const settings = await conferenceService.findOne();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Manage event information, attendee contact details, and registration behavior."
        className="mb-6"
      />

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
