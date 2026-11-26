import type { Metadata } from "next";

export const SITE_NAME = "All Choirs' Conference 2027";
export const DEFAULT_DESCRIPTION =
  "THE ABLE MINISTER — a gathering of choristers in purpose and power.";

type MetadataInput = {
  title: string;
  description?: string;
};

export function createMetadata({
  title,
  description,
}: MetadataInput): Metadata {
  return {
    title: title === SITE_NAME ? title : `${title} | ${SITE_NAME}`,
    description: description ?? DEFAULT_DESCRIPTION,
  };
}
