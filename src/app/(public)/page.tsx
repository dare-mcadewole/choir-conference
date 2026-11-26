import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { CountdownTimer } from "@/features/conference/components/countdown-timer";
import * as conferenceService from "@/features/conference/service";
import { formatConferenceDates } from "@/features/conference/utils";
import { RegistrationLookup } from "@/features/registration/components/lookup";
import * as speakerService from "@/features/speaker/service";
import { createMetadata, SITE_NAME } from "@/lib/seo";
import {
  AnchorScripture,
  ConferenceDetailsPill,
} from "./_components/conference-details";
import { LandingBackdrop } from "./_components/landing-backdrop";
import { LandingHeader } from "./_components/landing-header";
import { SpeakersSection } from "./_components/speakers-section";

export const metadata = createMetadata({
  title: SITE_NAME,
});

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
  await headers();
  const { settings, people } = await getLandingData();
  const title = settings?.title ?? "All Choirs' Conference '27";
  const theme = settings?.theme ?? "THE ABLE MINISTER";
  const registrationOpen = settings?.registrationOpen === true;
  const registrationLabel = settings
    ? "Registration closed"
    : "Registration unavailable";
  const anchorScripture = settings?.anchorScripture ?? "II Corinthians 3:6";
  const dateLabel = formatConferenceDates(
    settings?.eventStartDate,
    settings?.eventEndDate,
  );
  const venue = settings?.venue?.trim() || "Venue to be announced.";

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-white">
      <CountdownTimer
        targetDate={settings?.closesAt?.toISOString() ?? null}
        enabled={(settings?.showCountdownTimer ?? true) && registrationOpen}
      />

      <section className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8">
        <LandingBackdrop />

        <LandingHeader
          title={title}
          registrationOpen={registrationOpen}
          registrationLabel={registrationLabel}
        />

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

          <AnchorScripture scripture={anchorScripture} />

          <div id="register" className="mt-9 w-full mx-auto">
            <RegistrationLookup
              registrationOpen={registrationOpen}
              settingsAvailable={Boolean(settings)}
            />
          </div>

          <ConferenceDetailsPill dateLabel={dateLabel} venue={venue} />
        </div>

        <SpeakersSection people={people} />

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
