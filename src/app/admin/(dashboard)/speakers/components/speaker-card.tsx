import { getInitials } from "@/features/shared/utils/strings";
import type { AdminSpeaker } from "@/features/speaker/service";
import { EditSpeakerDialog } from "./edit-speaker-dialog";

export function SpeakerCard({ speaker }: { speaker: AdminSpeaker }) {
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-[#fbfcff] p-4">
      <div className="flex min-w-0 items-center gap-3">
        {speaker.imageUrl ? (
          <img
            src={speaker.imageUrl}
            alt=""
            loading="lazy"
            className="size-12 shrink-0 rounded-xl bg-slate-100 object-cover border-hairline"
          />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#eeeefe] text-sm font-semibold text-[#7778e8]">
            {getInitials(speaker.fullName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="min-w-0 truncate text-sm font-semibold text-slate-900">
              {speaker.fullName}
            </h2>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                speaker.published
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {speaker.published ? "Published" : "Draft"}
            </span>
          </div>
          {(speaker.designation || speaker.organization) && (
            <p className="truncate text-xs text-slate-500">
              {[speaker.designation, speaker.organization]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 min-h-10 line-clamp-2 text-xs leading-5 text-slate-500">
        {speaker.biography || "No biography added."}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-400">
          Display order: {speaker.sortOrder}
        </span>
        <EditSpeakerDialog speaker={speaker} />
      </div>
    </article>
  );
}
