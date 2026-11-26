ALTER TABLE "conference_family_assemblies" DROP CONSTRAINT "conference_family_assemblies_conference_id_conference_id_fk";
--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" DROP CONSTRAINT "conference_family_assemblies_family_id_conference_families_id_fk";
--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" DROP CONSTRAINT "conference_family_assemblies_assembly_id_assemblies_id_fk";
--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" ADD CONSTRAINT "conference_family_assemblies_conference_id_conference_id_fk" FOREIGN KEY ("conference_id") REFERENCES "public"."conference"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" ADD CONSTRAINT "conference_family_assemblies_family_id_conference_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."conference_families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conference_family_assemblies" ADD CONSTRAINT "conference_family_assemblies_assembly_id_assemblies_id_fk" FOREIGN KEY ("assembly_id") REFERENCES "public"."assemblies"("id") ON DELETE cascade ON UPDATE no action;