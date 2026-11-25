import { lookupRegistrant } from "@/features/registration/service";

export type TicketDetails = {
  fullName: string;
  code: string;
  assembly: string | null;
  family: string | null;
  token: string;
};

export interface HistoricalJsonData {
  age?: string;
  paid?: string;
  part?: string;
  type?: string;
  year?: string;
  tagId?: string;
  amount?: string;
  family?: string;
  gender?: string;
  member?: string;
  tag_id?: string;
  ageRange?: string;
  assembly?: string;
  category?: string;
  ticketId?: string;
  is_musician?: string;
  merged_from: {
    source?: string;
    source_id?: string;
  };
  ticketCount?: string;
  choir_position?: string;
  payment_channel?: string;
  paymentReference?: string;
  medicalInformation?: string;
  musical_instruments?: string;
  educational_background?: string;
  institution?: string;
}

export type RegistrantLookupData = Awaited<ReturnType<typeof lookupRegistrant>>;
