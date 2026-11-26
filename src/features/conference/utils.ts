const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatConferenceDate(value: Date | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function formatConferenceDates(
  start: Date | null | undefined,
  end: Date | null | undefined,
) {
  if (!start && !end) return "Dates to be announced";
  if (!start) return formatConferenceDate(end) ?? "Dates to be announced";
  if (!end) return formatConferenceDate(start) ?? "Dates to be announced";

  if (start.getTime() === end.getTime()) {
    return formatConferenceDate(start) ?? "Dates to be announced";
  }

  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endMonth = end.getUTCMonth();

  if (startYear === endYear && startMonth === endMonth) {
    return `${MONTHS[startMonth]} ${start.getUTCDate()}–${end.getUTCDate()}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `${MONTHS[startMonth]} ${start.getUTCDate()} – ${MONTHS[endMonth]} ${end.getUTCDate()}, ${startYear}`;
  }

  return `${formatConferenceDate(start)} – ${formatConferenceDate(end)}`;
}
