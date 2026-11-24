ALTER TABLE "registrations" RENAME COLUMN "institution_id" TO "institution";--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_institution_id_institutions_id_fk";
--> statement-breakpoint
ALTER TABLE "speakers" ALTER COLUMN "links" DROP NOT NULL;