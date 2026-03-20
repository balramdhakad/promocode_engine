CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."promo_status" AS ENUM('active', 'inactive', 'expired', 'exhausted', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."promo_target" AS ENUM('all', 'specific_users', 'new_users', 'segment');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"first_order_at" timestamp,
	"segment" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_discount_amount" numeric(10, 2),
	"min_order_value" numeric(10, 2) DEFAULT '0' NOT NULL,
	"target" "promo_target" DEFAULT 'all' NOT NULL,
	"target_segment" varchar(100),
	"max_usage_global" integer,
	"max_usage_per_user" integer,
	"status" "promo_status" DEFAULT 'active' NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"daily_start_time" varchar(5),
	"daily_end_time" varchar(5),
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_user_whitelist" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"promo_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"promo_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_applied" numeric(10, 2) NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_validation_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"promo_id" uuid,
	"code" varchar(50) NOT NULL,
	"user_id" uuid,
	"order_amount" numeric(10, 2),
	"is_valid" boolean NOT NULL,
	"fail_reason" varchar(100),
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_user_whitelist" ADD CONSTRAINT "promo_user_whitelist_promo_id_promo_codes_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_user_whitelist" ADD CONSTRAINT "promo_user_whitelist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_promo_id_promo_codes_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_validation_logs" ADD CONSTRAINT "promo_validation_logs_promo_id_promo_codes_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_validation_logs" ADD CONSTRAINT "promo_validation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_promo_codes_one_active_per_code" ON "promo_codes" USING btree ("code") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_promo_codes_status" ON "promo_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_expires_at" ON "promo_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_code" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_whitelist_promo_user" ON "promo_user_whitelist" USING btree ("promo_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_whitelist_user_id" ON "promo_user_whitelist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_redemptions_user_id" ON "promo_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_redemptions_code" ON "promo_redemptions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_redemptions_code_user" ON "promo_redemptions" USING btree ("code","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_redemptions_order_id" ON "promo_redemptions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_val_logs_code" ON "promo_validation_logs" USING btree ("code","user_id");--> statement-breakpoint
CREATE INDEX "idx_val_logs_user_id" ON "promo_validation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_val_logs_is_valid" ON "promo_validation_logs" USING btree ("is_valid");