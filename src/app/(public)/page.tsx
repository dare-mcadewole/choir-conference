import { ArrowDownRight, Music2, Sparkles } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { RegistrationForm } from "@/components/forms/registration-form";
import { getDb } from "@/db";
import { speakers } from "@/db/schema";
import { publicRegistrationOptions } from "@/features/registration/service";

async function getLandingData() {
  try {
    const db = getDb();
    const [settings, people, options] = await Promise.all([
      db.query.conferenceSettings.findFirst(),
      db
        .select()
        .from(speakers)
        .where(eq(speakers.published, true))
        .orderBy(asc(speakers.sortOrder)),
      publicRegistrationOptions(),
    ]);
    return { settings, people, options };
  } catch {
    return {
      settings: null,
      people: [],
      options: {
        assemblies: [],
        categories: [],
        positions: [],
        institutions: [],
        levels: [],
      },
    };
  }
}

export default async function HomePage() {
  const { settings, people, options } = await getLandingData();
  const title = settings?.title ?? "All Choirs Conference '27";
  const theme = settings?.theme ?? "THE ABLE MINISTER";

  return (
    <main className="min-h-screen overflow-hidden bg-[#071b22] text-white">
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-6 sm:px-8 md:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_23%,#159a92_0%,#0c4f55_28%,#0a2530_58%,#071b22_100%)]" />
        <div className="pointer-events-none absolute -left-10 top-[52%] size-32 rounded-full bg-[#c3f27a] blur-[2px] opacity-90 [clip-path:polygon(50%_0%,61%_35%,86%_14%,70%_43%,100%_50%,70%_57%,86%_86%,61%_65%,50%_100%,39%_65%,14%_86%,30%_57%,0_50%,30%_43%,14%_14%,39%_35%)]" />
        <div className="pointer-events-none absolute -right-9 top-[46%] size-28 bg-[#f5b5ef] opacity-90 [clip-path:polygon(50%_0%,61%_35%,86%_14%,70%_43%,100%_50%,70%_57%,86%_86%,61%_65%,50%_100%,39%_65%,14%_86%,30%_57%,0_50%,30%_43%,14%_14%,39%_35%)]" />

        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 font-display text-lg font-bold tracking-tight sm:text-2xl">
            <span className="grid size-10 place-items-center rounded-full bg-emerald-400 text-[#071b22]">
              <Music2 size={21} />
            </span>
            {title}
          </div>
          <a
            href="#register"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-[#071b22] hover:bg-emerald-300"
          >
            Register <ArrowDownRight size={17} />
          </a>
        </header>

        <div className="mx-auto flex min-h-[470px] max-w-5xl flex-col items-center justify-center pb-12 pt-20 text-center md:min-h-[540px]">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/30 bg-emerald-100/10 px-4 py-2 text-[11px] font-semibold tracking-[.14em] text-emerald-50 uppercase">
            <Sparkles size={14} /> 2027 Conference
          </p>
          <h1 className="max-w-4xl font-display text-5xl leading-[.93] tracking-[-.055em] sm:text-7xl md:text-8xl">
            {theme}
          </h1>
          <p className="mt-7 max-w-lg text-sm leading-6 text-emerald-50/80 sm:text-base">
            A global gathering for choristers called to serve with grace, skill,
            and spiritual weight.
          </p>
          <a
            href="#register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#071b22] shadow-xl shadow-black/20 hover:bg-emerald-50"
          >
            Join the conference <ArrowDownRight size={17} />
          </a>
        </div>

        <div className="mx-auto flex max-w-6xl items-end justify-center gap-3 px-0 sm:gap-5">
          {people.slice(0, 5).map((speaker, index) => (
            <article
              key={speaker.id}
              className={`group relative hidden aspect-[.7] w-[18%] min-w-0 overflow-hidden rounded-t-2xl border border-white/25 bg-gradient-to-b from-[#2a625f] to-[#102a32] shadow-2xl sm:block ${index === 2 ? "mb-7 w-[24%]" : index % 2 ? "mb-3" : ""}`}
              style={{ transform: `rotate(${(index - 2) * 3}deg)` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.18),transparent_36%)]" />
              {speaker.imageUrl ? (
                <img
                  src={speaker.imageUrl}
                  alt={speaker.fullName}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center font-display text-5xl text-white/35">
                  {speaker.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute inset-x-2 bottom-3 rounded-full bg-white/90 px-2 py-1 text-center text-[10px] font-bold text-[#071b22] backdrop-blur">
                {speaker.fullName}
              </span>
            </article>
          ))}
          {!people.length && (
            <div className="rounded-2xl border border-white/15 bg-white/[.06] px-7 py-5 text-center text-sm text-emerald-50/75">
              Speakers will be announced soon.
            </div>
          )}
        </div>
      </section>

      <section
        id="register"
        className="relative bg-[#f7f7f3] py-16 text-[#071b22] sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-9 text-center">
            <p className="text-xs font-bold tracking-[.2em] text-[#07877c] uppercase">
              Registration
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
              Save your seat.
            </h2>
          </div>
          <div className="rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(7,27,34,.14)] sm:p-9">
            <RegistrationForm {...options} />
          </div>
        </div>
      </section>
    </main>
  );
}
