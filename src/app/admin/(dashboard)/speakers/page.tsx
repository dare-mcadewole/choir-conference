import { Mic, Users } from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import * as speakerService from "@/features/speaker/service";
import { SpeakerCard } from "./components/speaker-card";

export default async function SpeakersPage() {
  const speakers = await speakerService.findAdminSpeakers();
  const publishedCount = speakers.filter((speaker) => speaker.published).length;

  return (
    <>
      <AdminPageHeader
        title="Speakers"
        description="Manage speaker profiles and control which speakers appear on the public conference page."
      />

      {speakers.length ? (
        <section
          aria-label="Speaker directory"
          className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Speaker directory
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {speakers.length} speakers · {publishedCount} published
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Mic size={18} />
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {speakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
          <Users className="mx-auto text-slate-300" size={26} />
          <p className="mt-3 text-sm font-medium text-slate-700">
            No speaker profiles found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Speaker profiles will appear here when they are added.
          </p>
        </section>
      )}
    </>
  );
}
