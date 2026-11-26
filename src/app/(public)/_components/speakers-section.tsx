import { Mic } from "lucide-react";
import { getInitials } from "@/features/shared/utils/strings";
import type { PublicSpeaker } from "@/features/speaker/service";
import { cn } from "@/lib/utils";

export function SpeakersSection({ people }: { people: PublicSpeaker[] }) {
  return (
    <>
      <h4
        className="
          mt-12 sm:mt-20 mb-8 container text-xl text-secondary uppercase font-bold
          flex items-center gap-2 relative
        "
      >
        <Mic size={40} strokeWidth={0.75} />
        Our Speakers
      </h4>

      <div
        className="
          relative container gap-2 sm:gap-2 gap-y-6
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6
        "
      >
        {people.slice(0, 6).map((speaker) => (
          <div
            key={speaker.id}
            className="flex flex-col gap-2 justify-center items-center mb-2 md:mb-4"
          >
            <article
              className={cn(
                "group relative aspect-[.68] overflow-hidden rounded-lg h-64",
                "bg-primary-200 shadow-[0_16px_35px_rgba(3,15,55,.35)]",
              )}
            >
              <div
                className="
                  absolute inset-0 bg-[sradial-gradient(circle_at_50%_22%,rgba(255,255,255,.28),transparent_40%)]
                "
              />

              {speaker.imageUrl ? (
                <img
                  src={speaker.imageUrl}
                  alt={speaker.fullName}
                  className={cn(
                    "size-full object-cover transform transition duration-500 group-hover:opacity-90",
                    [speaker.htmlClassName],
                  )}
                />
              ) : (
                <div className="grid size-full place-items-center font-display text-6xl text-white/45">
                  {getInitials(speaker.fullName)}
                </div>
              )}

              <div
                className="
                  absolute left-0 inset-0 right-0 top-0 bottom-0 bg-gradient-to-b from-transparent to-primary/30
                "
              />
            </article>

            <div
              className="
                whitespace-nowrap px-3 py-1.5 text-center tracking-wider filter backdrop-blur-md
                inline-block rounded-full bg-black/15 text-[10px] font-semibold text-white
              "
            >
              {speaker.fullName}
              {speaker.designation && ` (${speaker.designation})`}
            </div>
          </div>
        ))}

        {!people.length && (
          <div className="rounded-2xl border border-white/35 bg-white/10 px-6 py-4 text-sm text-white/85">
            Speakers announced soon.
          </div>
        )}
      </div>
    </>
  );
}
