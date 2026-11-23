import { ArrowDown, Music2, Plus } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { RegistrationLookup } from "@/components/public/lookup";
import { getDb } from "@/db";
import { speakers } from "@/db/schema";

async function getLandingData() {
  try {
    const db = getDb();
    const [settings, people] = await Promise.all([
      db.query.conferenceSettings.findFirst(),
      db
        .select()
        .from(speakers)
        .where(eq(speakers.published, true))
        .orderBy(asc(speakers.sortOrder)),
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
      <section className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]" />
        <div className="pointer-events-none absolute -left-14 top-[52%] size-40 rounded-full bg-[#fc63c1] sm:size-56" />
        <div className="pointer-events-none absolute -right-7 top-20 size-20 rounded-full bg-[#fc63c1] sm:right-[12%] sm:size-28" />
        <div className="pointer-events-none absolute -right-16 top-[-8%] h-72 w-24 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-80 sm:h-[30rem] sm:w-32" />
        <div className="pointer-events-none absolute -left-24 bottom-8 h-64 w-20 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-75 sm:h-96 sm:w-28" />
        <div className="pointer-events-none absolute left-[13%] top-[37%] h-4 w-52 -rotate-[14deg] rounded-full bg-secondary sm:h-7 sm:w-64" />
        <div className="pointer-events-none absolute right-[5%] top-[54%] h-3 w-28 rotate-[24deg] rounded-full bg-secondary sm:w-44" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 text-base font-semibold tracking-tight sm:text-xl">
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
              <Music2 size={19} />
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
          <p className="text-base mt-1 font-bold tracking-[.52em] text-white/75 uppercase">
            All Choirs' Conference '27
          </p>
          <h1
            className="
              mt-7 max-w-4xl font-display text-5xl leading-[.82] tracking-[-.025em]
              sm:text-7xl md:text-8xl
            "
            dangerouslySetInnerHTML={{ __html: theme }}
          />

          <div id="register" className="mt-9 w-full mx-auto">
            <RegistrationLookup />
          </div>
        </div>

        <div className="relative mx-auto mt-12 flex max-w-6xl items-end justify-center gap-2 sm:mt-16 sm:gap-4">
          {people.slice(0, 5).map((speaker, index) => (
            <article
              key={speaker.id}
              className={`group relative hidden aspect-[.68] overflow-hidden rounded-t-2xl border border-white/40 bg-primary-700 shadow-[0_16px_35px_rgba(3,15,55,.35)] sm:block ${index === 2 ? "z-10 mb-7 w-[24%]" : "w-[18%]"} ${index % 2 ? "mb-3" : ""}`}
              style={{ transform: `rotate(${(index - 2) * 2.5}deg)` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,.28),transparent_40%)]" />
              {speaker.imageUrl ? (
                <img
                  src={speaker.imageUrl}
                  alt={speaker.fullName}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center font-display text-6xl text-white/45">
                  {speaker.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-bold text-primary">
                {speaker.fullName}
              </span>
            </article>
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
