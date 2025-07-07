create type "public"."stripe_order_status" as enum ('pending', 'completed', 'canceled');

create type "public"."stripe_subscription_status" as enum ('not_started', 'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');

create table "public"."orders" (
    "id" uuid not null default uuid_generate_v4(),
    "stripe_session_id" text not null,
    "customer_email" text not null,
    "items" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "readable_order_id" text
);


alter table "public"."orders" enable row level security;

create table "public"."product_variants" (
    "id" uuid not null default gen_random_uuid(),
    "product_id" uuid,
    "price_pence" integer not null,
    "description" text,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now()
);


create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "variant" text,
    "description" text,
    "price_pence" integer not null,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "price_pennies" integer not null default 0
);


create table "public"."stripe_customers" (
    "id" bigint generated always as identity not null,
    "user_id" uuid not null,
    "customer_id" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
);


alter table "public"."stripe_customers" enable row level security;

create table "public"."stripe_orders" (
    "id" bigint generated always as identity not null,
    "checkout_session_id" text not null,
    "payment_intent_id" text not null,
    "customer_id" text not null,
    "amount_subtotal" bigint not null,
    "amount_total" bigint not null,
    "currency" text not null,
    "payment_status" text not null,
    "status" stripe_order_status not null default 'pending'::stripe_order_status,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone,
    "session_id" text
);


alter table "public"."stripe_orders" enable row level security;

create table "public"."stripe_subscriptions" (
    "id" bigint generated always as identity not null,
    "customer_id" text not null,
    "subscription_id" text,
    "price_id" text,
    "current_period_start" bigint,
    "current_period_end" bigint,
    "cancel_at_period_end" boolean default false,
    "payment_method_brand" text,
    "payment_method_last4" text,
    "status" stripe_subscription_status not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
);


alter table "public"."stripe_subscriptions" enable row level security;

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);

CREATE UNIQUE INDEX idx_orders_readable_order_id ON public.orders USING btree (readable_order_id);

CREATE INDEX idx_orders_readable_order_id_asc ON public.orders USING btree (readable_order_id);

CREATE INDEX idx_orders_stripe_session_id ON public.orders USING btree (stripe_session_id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX product_variants_pkey ON public.product_variants USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX stripe_customers_customer_id_key ON public.stripe_customers USING btree (customer_id);

CREATE UNIQUE INDEX stripe_customers_pkey ON public.stripe_customers USING btree (id);

CREATE UNIQUE INDEX stripe_customers_user_id_key ON public.stripe_customers USING btree (user_id);

CREATE UNIQUE INDEX stripe_orders_pkey ON public.stripe_orders USING btree (id);

CREATE UNIQUE INDEX stripe_subscriptions_customer_id_key ON public.stripe_subscriptions USING btree (customer_id);

CREATE UNIQUE INDEX stripe_subscriptions_pkey ON public.stripe_subscriptions USING btree (id);

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."product_variants" add constraint "product_variants_pkey" PRIMARY KEY using index "product_variants_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."stripe_customers" add constraint "stripe_customers_pkey" PRIMARY KEY using index "stripe_customers_pkey";

alter table "public"."stripe_orders" add constraint "stripe_orders_pkey" PRIMARY KEY using index "stripe_orders_pkey";

alter table "public"."stripe_subscriptions" add constraint "stripe_subscriptions_pkey" PRIMARY KEY using index "stripe_subscriptions_pkey";

alter table "public"."product_variants" add constraint "product_variants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;

alter table "public"."product_variants" validate constraint "product_variants_product_id_fkey";

alter table "public"."stripe_customers" add constraint "stripe_customers_customer_id_key" UNIQUE using index "stripe_customers_customer_id_key";

alter table "public"."stripe_customers" add constraint "stripe_customers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."stripe_customers" validate constraint "stripe_customers_user_id_fkey";

alter table "public"."stripe_customers" add constraint "stripe_customers_user_id_key" UNIQUE using index "stripe_customers_user_id_key";

alter table "public"."stripe_subscriptions" add constraint "stripe_subscriptions_customer_id_key" UNIQUE using index "stripe_subscriptions_customer_id_key";

create or replace view "public"."stripe_user_orders" as  SELECT customer_id AS id,
    amount_subtotal,
    amount_total,
    currency,
    payment_status,
    session_id
   FROM stripe_orders;


create or replace view "public"."stripe_user_subscriptions" as  SELECT c.customer_id,
    s.subscription_id,
    s.status AS subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
   FROM (stripe_customers c
     LEFT JOIN stripe_subscriptions s ON ((c.customer_id = s.customer_id)))
  WHERE ((c.user_id = auth.uid()) AND (c.deleted_at IS NULL) AND (s.deleted_at IS NULL));


grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."product_variants" to "anon";

grant insert on table "public"."product_variants" to "anon";

grant references on table "public"."product_variants" to "anon";

grant select on table "public"."product_variants" to "anon";

grant trigger on table "public"."product_variants" to "anon";

grant truncate on table "public"."product_variants" to "anon";

grant update on table "public"."product_variants" to "anon";

grant delete on table "public"."product_variants" to "authenticated";

grant insert on table "public"."product_variants" to "authenticated";

grant references on table "public"."product_variants" to "authenticated";

grant select on table "public"."product_variants" to "authenticated";

grant trigger on table "public"."product_variants" to "authenticated";

grant truncate on table "public"."product_variants" to "authenticated";

grant update on table "public"."product_variants" to "authenticated";

grant delete on table "public"."product_variants" to "service_role";

grant insert on table "public"."product_variants" to "service_role";

grant references on table "public"."product_variants" to "service_role";

grant select on table "public"."product_variants" to "service_role";

grant trigger on table "public"."product_variants" to "service_role";

grant truncate on table "public"."product_variants" to "service_role";

grant update on table "public"."product_variants" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."stripe_customers" to "anon";

grant insert on table "public"."stripe_customers" to "anon";

grant references on table "public"."stripe_customers" to "anon";

grant select on table "public"."stripe_customers" to "anon";

grant trigger on table "public"."stripe_customers" to "anon";

grant truncate on table "public"."stripe_customers" to "anon";

grant update on table "public"."stripe_customers" to "anon";

grant delete on table "public"."stripe_customers" to "authenticated";

grant insert on table "public"."stripe_customers" to "authenticated";

grant references on table "public"."stripe_customers" to "authenticated";

grant select on table "public"."stripe_customers" to "authenticated";

grant trigger on table "public"."stripe_customers" to "authenticated";

grant truncate on table "public"."stripe_customers" to "authenticated";

grant update on table "public"."stripe_customers" to "authenticated";

grant delete on table "public"."stripe_customers" to "service_role";

grant insert on table "public"."stripe_customers" to "service_role";

grant references on table "public"."stripe_customers" to "service_role";

grant select on table "public"."stripe_customers" to "service_role";

grant trigger on table "public"."stripe_customers" to "service_role";

grant truncate on table "public"."stripe_customers" to "service_role";

grant update on table "public"."stripe_customers" to "service_role";

grant delete on table "public"."stripe_orders" to "anon";

grant insert on table "public"."stripe_orders" to "anon";

grant references on table "public"."stripe_orders" to "anon";

grant select on table "public"."stripe_orders" to "anon";

grant trigger on table "public"."stripe_orders" to "anon";

grant truncate on table "public"."stripe_orders" to "anon";

grant update on table "public"."stripe_orders" to "anon";

grant delete on table "public"."stripe_orders" to "authenticated";

grant insert on table "public"."stripe_orders" to "authenticated";

grant references on table "public"."stripe_orders" to "authenticated";

grant select on table "public"."stripe_orders" to "authenticated";

grant trigger on table "public"."stripe_orders" to "authenticated";

grant truncate on table "public"."stripe_orders" to "authenticated";

grant update on table "public"."stripe_orders" to "authenticated";

grant delete on table "public"."stripe_orders" to "service_role";

grant insert on table "public"."stripe_orders" to "service_role";

grant references on table "public"."stripe_orders" to "service_role";

grant select on table "public"."stripe_orders" to "service_role";

grant trigger on table "public"."stripe_orders" to "service_role";

grant truncate on table "public"."stripe_orders" to "service_role";

grant update on table "public"."stripe_orders" to "service_role";

grant delete on table "public"."stripe_subscriptions" to "anon";

grant insert on table "public"."stripe_subscriptions" to "anon";

grant references on table "public"."stripe_subscriptions" to "anon";

grant select on table "public"."stripe_subscriptions" to "anon";

grant trigger on table "public"."stripe_subscriptions" to "anon";

grant truncate on table "public"."stripe_subscriptions" to "anon";

grant update on table "public"."stripe_subscriptions" to "anon";

grant delete on table "public"."stripe_subscriptions" to "authenticated";

grant insert on table "public"."stripe_subscriptions" to "authenticated";

grant references on table "public"."stripe_subscriptions" to "authenticated";

grant select on table "public"."stripe_subscriptions" to "authenticated";

grant trigger on table "public"."stripe_subscriptions" to "authenticated";

grant truncate on table "public"."stripe_subscriptions" to "authenticated";

grant update on table "public"."stripe_subscriptions" to "authenticated";

grant delete on table "public"."stripe_subscriptions" to "service_role";

grant insert on table "public"."stripe_subscriptions" to "service_role";

grant references on table "public"."stripe_subscriptions" to "service_role";

grant select on table "public"."stripe_subscriptions" to "service_role";

grant trigger on table "public"."stripe_subscriptions" to "service_role";

grant truncate on table "public"."stripe_subscriptions" to "service_role";

grant update on table "public"."stripe_subscriptions" to "service_role";

create policy "Service role can insert orders"
on "public"."orders"
as permissive
for insert
to public
with check (true);


create policy "Service role can update orders"
on "public"."orders"
as permissive
for update
to public
using (true);


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to public
using ((auth.email() = customer_email));


create policy "Service role can manage all customer data"
on "public"."stripe_customers"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can read own customer data"
on "public"."stripe_customers"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


create policy "Users can view their own customer data"
on "public"."stripe_customers"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) AND (deleted_at IS NULL)));


create policy "Allow users (authenticated or guest) to view their own orders"
on "public"."stripe_orders"
as permissive
for select
to authenticated, anon
using ((((auth.role() = 'authenticated'::text) AND (customer_id IN ( SELECT c.customer_id
   FROM stripe_customers c
  WHERE (c.user_id = auth.uid())))) OR ((auth.role() = 'anon'::text) AND (session_id = current_setting('request.jwt.claims.session_id'::text, true)))));


create policy "Service role can manage all data"
on "public"."stripe_orders"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can view their own order data"
on "public"."stripe_orders"
as permissive
for select
to authenticated
using (((customer_id IN ( SELECT stripe_customers.customer_id
   FROM stripe_customers
  WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL)));


create policy "Users can view their own subscription data"
on "public"."stripe_subscriptions"
as permissive
for select
to authenticated
using (((customer_id IN ( SELECT stripe_customers.customer_id
   FROM stripe_customers
  WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL)));



