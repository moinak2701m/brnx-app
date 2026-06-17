CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('family', 'self', 'friend', 'business');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending_wire', 'wire_received', 'usdc_received', 'usdc_sent', 'payout_initiated', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"bank_name" varchar(255),
	"account_number" varchar(50) NOT NULL,
	"ifsc" varchar(20) NOT NULL,
	"relationship" "relationship" DEFAULT 'family' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"beneficiary_id" uuid,
	"status" "tx_status" DEFAULT 'pending_wire' NOT NULL,
	"amount_usd" numeric(12, 2) NOT NULL,
	"amount_inr" numeric(14, 2) NOT NULL,
	"exchange_rate" numeric(10, 4),
	"pv_transaction_id" varchar(64),
	"pv_quote_id" varchar(64),
	"bank_details" jsonb,
	"beneficiary_snapshot" jsonb,
	"credible_payout_id" varchar(64),
	"credible_deposit_address" varchar(128),
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(30),
	"kyc_status" "kyc_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_beneficiary_id_beneficiaries_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "beneficiaries_user_id_idx" ON "beneficiaries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_pv_id_idx" ON "transactions" USING btree ("pv_transaction_id");