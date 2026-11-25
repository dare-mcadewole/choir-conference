CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";