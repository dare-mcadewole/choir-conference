--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" ADD CONSTRAINT "conference_family_assembly_unique" UNIQUE("conference_id","family_id","assembly_id");