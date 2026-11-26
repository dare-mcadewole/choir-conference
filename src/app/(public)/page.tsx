import { ArrowDown, Mic, Plus } from "lucide-react";
import { RegistrationLookup } from "@/features/registration/components/lookup";
import * as conferenceService from "@/features/conference/service";
import { CountdownTimer } from "@/features/conference/components/countdown-timer";
import * as speakerService from "@/features/speaker/service";
import { getInitials } from "@/features/shared/utils/strings";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

async function getLandingData() {
  try {
    const [settings, people] = await Promise.all([
      conferenceService.findOne(),
      speakerService.findPublished(),
    ]);
    return { settings, people };
  } catch {
    return { settings: null, people: [] };
  }
}

export default async function HomePage() {
  const { settings, people } = await getLandingData();
  const title = settings?.title ?? "All Choirs' Conference '27";
  const theme = settings?.theme ?? "THE ABLE MINISTER";

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-white">
      <CountdownTimer
        targetDate={settings?.closesAt?.toISOString() ?? null}
        enabled={settings?.showCountdownTimer ?? true}
      />
      <section className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]" />
        <div className="pointer-events-none absolute -left-14 top-[52%] size-40 rounded-full bg-[#fc63c1] sm:size-56" />
        <div className="pointer-events-none absolute -right-7 top-20 size-20 rounded-full bg-[#fc63c1] sm:right-[12%] sm:size-28" />
        <div className="pointer-events-none absolute -right-16 top-[-8%] h-72 w-24 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-80 sm:h-[30rem] sm:w-32" />
        <div className="pointer-events-none absolute -left-24 bottom-8 h-64 w-20 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-75 sm:h-96 sm:w-28" />
        <div className="pointer-events-none absolute left-[13%] top-[37%] h-4 w-52 -rotate-[14deg] rounded-full bg-secondary/0 sm:h-7 sm:w-64" />
        <div className="pointer-events-none absolute right-[5%] top-[54%] h-3 w-28 rotate-[24deg] rounded-full bg-secondary/0 sm:w-44" />

        <header className="relative page-shell flex items-center justify-between">
          <div className="flex items-center gap-3 text-base font-semibold tracking-tight sm:text-xl">
            <span className="grid size-9 place-items-center rounded-full bg-primary">
              <Logo className="size-7" />
            </span>
            {title}
          </div>
          <a
            href="#register"
            className="hidden items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-medium sm:inline-flex"
          >
            Register now <ArrowDown size={16} />
          </a>
        </header>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center pt-20 text-center sm:pt-24">
          <p className="text-xs sm:text-base mt-1 font-bold tracking-[.52em] text-white/75 uppercase">
            All Choirs' Conference '27
          </p>
          <h1
            className="
              mt-7 max-w-4xl font-display text-6xl sm:leading-[.82] tracking-[-.025em]
              sm:text-7xl md:text-8xl uppercase
            "
          >
            {theme}
          </h1>

          <div id="register" className="mt-9 w-full mx-auto">
            <RegistrationLookup />
          </div>
        </div>

        <h4
          className="
            mt-16 sm:mt-28 mb-8 container text-xl text-secondary uppercase font-bold
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
        <Plus
          className="pointer-events-none absolute bottom-[18%] left-[16%] text-white/50"
          size={19}
        />
        <Plus
          className="pointer-events-none absolute right-[16%] top-[32%] text-white/50"
          size={19}
        />
      </section>
    </main>
  );
}
