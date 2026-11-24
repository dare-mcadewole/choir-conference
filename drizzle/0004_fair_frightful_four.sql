CREATE TYPE "public"."vocal_part" AS ENUM('SOPRANO', 'ALTO', 'TENOR', 'BASS');--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "part" "vocal_part" NOT NULL;