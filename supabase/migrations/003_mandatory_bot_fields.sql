
alter table "public"."bots" alter column "created_at" set not null;

alter table "public"."bots" alter column "desired_direction" drop default;

alter table "public"."bots" alter column "desired_direction" set not null;

alter table "public"."bots" alter column "updated_at" set not null;