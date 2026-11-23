CREATE TYPE "public"."institution_type" AS ENUM('SECONDARY', 'TERTIARY');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('VALID', 'CANCELLED', 'USED');--> statement-breakpoint
CREATE TABLE "academic_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"institution_type" "institution_type" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assemblies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"family_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conference_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"icon" varchar(60) NOT NULL,
	"description" text,
	"whatsapp_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conference_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) DEFAULT 'All Choirs'' Conference 2027' NOT NULL,
	"theme" varchar(200) DEFAULT 'THE ABLE MINISTER' NOT NULL,
	"description" text,
	"event_date" timestamp with time zone,
	"venue" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(40),
	"registration_open" boolean DEFAULT true NOT NULL,
	"registration_lookup_enabled" boolean DEFAULT true NOT NULL,
	"historical_lookup_enabled" boolean DEFAULT true NOT NULL,
	"allow_duplicates" boolean DEFAULT false NOT NULL,
	"require_payment" boolean DEFAULT false NOT NULL,
	"opens_at" timestamp with time zone,
	"closes_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid,
	"type" varchar(80) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"provider_id" varchar(120),
	"status" varchar(40) NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historical_registrants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" "institution_type" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"reference" varchar(120) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"provider_payload" jsonb,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_positions" (
	"registration_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"gender" varchar(32) NOT NULL,
	"assembly_id" uuid NOT NULL,
	"family_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"central_choir_member" boolean NOT NULL,
	"institution_id" uuid,
	"academic_level_id" uuid,
	"status" "registration_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"registration_code" varchar(20),
	"ticket_token" varchar(80),
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_code_unique" UNIQUE("registration_code"),
	CONSTRAINT "registrations_ticket_token_unique" UNIQUE("ticket_token")
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"designation" varchar(160),
	"organization" varchar(160),
	"biography" text,
	"image_url" text,
	"links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"category_slug" varchar(100) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"token" varchar(80) NOT NULL,
	"status" "ticket_status" DEFAULT 'VALID' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"event_id" varchar(160) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assemblies" ADD CONSTRAINT "assemblies_family_id_conference_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."conference_families"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_positions" ADD CONSTRAINT "registration_positions_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_positions" ADD CONSTRAINT "registration_positions_position_id_position_options_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_assembly_id_assemblies_id_fk" FOREIGN KEY ("assembly_id") REFERENCES "public"."assemblies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_family_id_conference_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."conference_families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_category_id_registration_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."registration_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_academic_level_id_academic_levels_id_fk" FOREIGN KEY ("academic_level_id") REFERENCES "public"."academic_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assembly_slug_unique" ON "assemblies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "assembly_family_idx" ON "assemblies" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "family_slug_unique" ON "conference_families" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "historical_email_idx" ON "historical_registrants" USING btree ("email");--> statement-breakpoint
CREATE INDEX "historical_phone_idx" ON "historical_registrants" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "institution_name_unique" ON "institutions" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_reference_unique" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "payment_registration_idx" ON "payments" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_unique" ON "registration_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_position_unique" ON "registration_positions" USING btree ("registration_id","position_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_code_unique" ON "registrations" USING btree ("registration_code");--> statement-breakpoint
CREATE INDEX "registration_email_idx" ON "registrations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "registration_phone_idx" ON "registrations" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "registration_assembly_idx" ON "registrations" USING btree ("assembly_id");--> statement-breakpoint
CREATE INDEX "registration_status_idx" ON "registrations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_type_category_unique" ON "ticket_types" USING btree ("category_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_token_unique" ON "tickets" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_registration_unique" ON "tickets" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_event_unique" ON "payment_webhook_events" USING btree ("provider","event_id");