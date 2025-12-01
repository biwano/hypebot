drop policy "Allow all operations on bots" on "public"."bots";

alter table "public"."bots" add column "hyperliquid_private_key" text;

alter table "public"."bots" add column "hyperliquid_user" text;