

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_admin_permission"("user_uuid" "uuid", "resource_name" "text", "action_name" "text" DEFAULT 'read'::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    JOIN public.admin_role_permissions arp ON ar.id = arp.admin_role_id
    JOIN public.admin_permissions ap ON arp.permission_id = ap.id
    WHERE ar.user_id = user_uuid
      AND ar.is_active = true
      AND (ap.resource = resource_name OR ap.resource = 'all')
      AND (ap.action = action_name OR ap.action = 'all')
  );
END;
$$;


ALTER FUNCTION "public"."check_admin_permission"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_idempotency_keys"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_idempotency_keys"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_sync_status"() RETURNS TABLE("is_connected" boolean, "last_sync" timestamp with time zone, "last_sync_status" "text", "sync_progress" integer, "is_syncing" boolean, "connection_health" "text", "error_count" bigint, "warning_count" bigint, "inventory_changes" bigint, "data_conflicts" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.is_connected,
    ss.last_sync,
    ss.last_sync_status,
    ss.sync_progress,
    ss.is_syncing,
    ss.connection_health,
    (SELECT COUNT(*) FROM public.sync_errors WHERE resolved = false),
    (SELECT COUNT(*) FROM public.sync_errors WHERE severity = 'medium' AND resolved = false),
    (SELECT COUNT(*) FROM public.inventory_changes WHERE processed = false),
    (SELECT COUNT(*) FROM public.data_conflicts WHERE resolution = 'pending')
  FROM public.sync_status ss
  ORDER BY ss.timestamp DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_current_sync_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_acquisition_trends"("days_back" integer DEFAULT 30) RETURNS TABLE("date_key" "text", "new_customers" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_key,
    COUNT(*) as new_customers
  FROM public.customer_profiles
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(created_at)
  ORDER BY date_key;
END;
$$;


ALTER FUNCTION "public"."get_customer_acquisition_trends"("days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_statistics"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_customers', COUNT(*),
    'customers_today', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
    'customers_this_month', COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)),
    'customers_this_week', COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE))
  ) INTO result
  FROM public.customer_profiles;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_customer_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_orders_statistics"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(amount_total), 0),
    'average_order_value', COALESCE(AVG(amount_total), 0),
    'orders_today', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
    'revenue_today', COALESCE(SUM(amount_total) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0),
    'orders_this_month', COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)),
    'revenue_this_month', COALESCE(SUM(amount_total) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0),
    'status_breakdown', (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM public.orders
        GROUP BY status
      ) status_counts
    )
  ) INTO result
  FROM public.orders;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_orders_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_revenue_trends"("days_back" integer DEFAULT 30) RETURNS TABLE("date_key" "text", "order_count" bigint, "total_revenue" numeric, "average_order_value" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_key,
    COUNT(*) as order_count,
    COALESCE(SUM(amount_total), 0) as total_revenue,
    COALESCE(AVG(amount_total), 0) as average_order_value
  FROM public.orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(created_at)
  ORDER BY date_key;
END;
$$;


ALTER FUNCTION "public"."get_revenue_trends"("days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_products"("limit_count" integer DEFAULT 10) RETURNS TABLE("product_name" "text", "order_count" bigint, "total_revenue" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(oi.product_name, 'Unknown Product') as product_name,
    COUNT(*) as order_count,
    COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE o.status != 'cancelled'
  GROUP BY oi.product_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_top_products"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_admin_role"("user_uuid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'role', ar.role,
      'permissions', COALESCE(
        (SELECT jsonb_agg(ap.name)
         FROM public.admin_role_permissions arp
         JOIN public.admin_permissions ap ON arp.permission_id = ap.id
         WHERE arp.admin_role_id = ar.id), 
        '[]'::jsonb
      ),
      'is_active', ar.is_active
    )
    FROM public.admin_roles ar
    WHERE ar.user_id = user_uuid
  );
END;
$$;


ALTER FUNCTION "public"."get_user_admin_role"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_variants_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_variants_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_products_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_products_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sync_status"("p_is_connected" boolean DEFAULT NULL::boolean, "p_last_sync" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_last_sync_status" "text" DEFAULT NULL::"text", "p_sync_progress" integer DEFAULT NULL::integer, "p_is_syncing" boolean DEFAULT NULL::boolean, "p_connection_health" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.sync_status (
    timestamp,
    is_connected,
    last_sync,
    last_sync_status,
    sync_progress,
    is_syncing,
    connection_health
  ) VALUES (
    timezone('utc', now()),
    COALESCE(p_is_connected, (SELECT is_connected FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_last_sync, (SELECT last_sync FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_last_sync_status, (SELECT last_sync_status FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_sync_progress, (SELECT sync_progress FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_is_syncing, (SELECT is_syncing FROM public.sync_status ORDER BY timestamp DESC LIMIT 1)),
    COALESCE(p_connection_health, (SELECT connection_health FROM public.sync_status ORDER BY timestamp DESC LIMIT 1))
  );
END;
$$;


ALTER FUNCTION "public"."update_sync_status"("p_is_connected" boolean, "p_last_sync" timestamp with time zone, "p_last_sync_status" "text", "p_sync_progress" integer, "p_is_syncing" boolean, "p_connection_health" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "resource" "text" NOT NULL,
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_role_id" "uuid",
    "permission_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bundle_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bundle_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."bundle_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bundles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "retail_price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."bundles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "date_of_birth" "date",
    "marketing_consent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."customer_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_conflicts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "product_id" "text" NOT NULL,
    "conflict_type" "text" NOT NULL,
    "printful_data" "jsonb" NOT NULL,
    "local_data" "jsonb" NOT NULL,
    "resolution" "text" DEFAULT 'pending'::"text" NOT NULL,
    "auto_resolution" "text",
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "data_conflicts_conflict_type_check" CHECK (("conflict_type" = ANY (ARRAY['price_mismatch'::"text", 'inventory_mismatch'::"text", 'variant_mismatch'::"text", 'data_corruption'::"text"]))),
    CONSTRAINT "data_conflicts_resolution_check" CHECK (("resolution" = ANY (ARRAY['auto_resolved'::"text", 'manual_review'::"text", 'pending'::"text", 'resolved'::"text"])))
);


ALTER TABLE "public"."data_conflicts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fulfillments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "printful_order_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "tracking_number" "text",
    "tracking_url" "text",
    "shipped_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fulfillments" OWNER TO "postgres";


COMMENT ON TABLE "public"."fulfillments" IS 'Tracks Printful order fulfillment status and shipping information';



CREATE TABLE IF NOT EXISTS "public"."idempotency_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "result" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval)
);


ALTER TABLE "public"."idempotency_keys" OWNER TO "postgres";


COMMENT ON TABLE "public"."idempotency_keys" IS 'Prevents duplicate external API calls through idempotency key tracking';



CREATE TABLE IF NOT EXISTS "public"."inventory_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "product_id" "text" NOT NULL,
    "product_name" "text" NOT NULL,
    "variant_id" "text" NOT NULL,
    "variant_name" "text" NOT NULL,
    "change_type" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "processed" boolean DEFAULT false,
    "printful_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "inventory_changes_change_type_check" CHECK (("change_type" = ANY (ARRAY['stock_update'::"text", 'price_change'::"text", 'availability_change'::"text", 'new_variant'::"text"])))
);


ALTER TABLE "public"."inventory_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "subscribed_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "unsubscribed_at" timestamp with time zone
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "read" boolean DEFAULT false,
    "action_url" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['success'::"text", 'warning'::"text", 'error'::"text", 'info'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "order_number" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "total_amount" numeric(10,2) NOT NULL,
    "shipping_address" "jsonb",
    "billing_address" "jsonb",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "shipping_method" "text",
    "tracking_number" "text",
    "notes" "text",
    "canceled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "stripe_payment_intent_id" "text"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_order" integer DEFAULT 0,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "printful_product_id" "text",
    "custom_name" "text",
    "custom_description" "text",
    "custom_retail_price" numeric(10,2),
    "custom_category" "text",
    "custom_tags" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."product_overrides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "printful_variant_id" "text",
    "name" "text" NOT NULL,
    "value" "text" NOT NULL,
    "color" "text",
    "size" "text",
    "price" numeric(10,2),
    "in_stock" boolean DEFAULT true,
    "is_available" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "image_url" "text",
    "slug" "text",
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "reviews" integer DEFAULT 0,
    "rating" numeric(3,2) DEFAULT 4.5,
    "in_stock" boolean DEFAULT true,
    "stock_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "printful_product_id" "text",
    "printful_cost" numeric(10,2),
    "retail_price" numeric(10,2),
    "is_available" boolean DEFAULT true,
    "margin" numeric(10,2),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "printful_product_id_light" character varying(255),
    "custom_price" numeric(10,2),
    "printful_sync_product_id" integer
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "message" "text" NOT NULL,
    "details" "text",
    "resolved" boolean DEFAULT false,
    "webhook_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "sync_errors_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "sync_errors_type_check" CHECK (("type" = ANY (ARRAY['connection'::"text", 'inventory'::"text", 'data'::"text", 'webhook'::"text", 'validation'::"text"])))
);


ALTER TABLE "public"."sync_errors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "last_sync_status" "text" DEFAULT 'unknown'::"text",
    "last_sync" timestamp with time zone,
    "is_syncing" boolean DEFAULT false,
    "sync_progress" integer DEFAULT 0,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."sync_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email_order_confirmations" boolean DEFAULT true,
    "email_newsletter" boolean DEFAULT true,
    "email_product_recommendations" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source" "text" NOT NULL,
    "event_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false,
    "processed_at" timestamp with time zone,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."webhook_events" IS 'Audit trail for all incoming webhooks from Stripe and Printful';



CREATE TABLE IF NOT EXISTS "public"."webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "type" "text" NOT NULL,
    "webhook_type" "text",
    "data" "jsonb",
    "processed" boolean DEFAULT false,
    "processing_time_ms" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "webhook_logs_type_check" CHECK (("type" = ANY (ARRAY['success'::"text", 'error'::"text", 'timeout'::"text"])))
);


ALTER TABLE "public"."webhook_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_permissions"
    ADD CONSTRAINT "admin_permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."admin_permissions"
    ADD CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_admin_role_id_permission_id_key" UNIQUE ("admin_role_id", "permission_id");



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."bundle_items"
    ADD CONSTRAINT "bundle_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bundles"
    ADD CONSTRAINT "bundles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_conflicts"
    ADD CONSTRAINT "data_conflicts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fulfillments"
    ADD CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fulfillments"
    ADD CONSTRAINT "fulfillments_printful_order_id_key" UNIQUE ("printful_order_id");



ALTER TABLE ONLY "public"."idempotency_keys"
    ADD CONSTRAINT "idempotency_keys_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."idempotency_keys"
    ADD CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_changes"
    ADD CONSTRAINT "inventory_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_overrides"
    ADD CONSTRAINT "product_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_errors"
    ADD CONSTRAINT "sync_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_status"
    ADD CONSTRAINT "sync_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "unique_payment_intent" UNIQUE ("stripe_payment_intent_id");



COMMENT ON CONSTRAINT "unique_payment_intent" ON "public"."orders" IS 'CRITICAL: Prevents duplicate orders for same Stripe PaymentIntent';



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_event_id_key" UNIQUE ("event_id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_logs"
    ADD CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admin_permissions_resource_action" ON "public"."admin_permissions" USING "btree" ("resource", "action");



CREATE INDEX "idx_admin_role_permissions_role_id" ON "public"."admin_role_permissions" USING "btree" ("admin_role_id");



CREATE INDEX "idx_admin_roles_role" ON "public"."admin_roles" USING "btree" ("role");



CREATE INDEX "idx_admin_roles_user_id" ON "public"."admin_roles" USING "btree" ("user_id");



CREATE INDEX "idx_bundle_items_bundle_id" ON "public"."bundle_items" USING "btree" ("bundle_id");



CREATE INDEX "idx_bundle_items_product_id" ON "public"."bundle_items" USING "btree" ("product_id");



CREATE INDEX "idx_customer_profiles_user_id" ON "public"."customer_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_data_conflicts_conflict_type" ON "public"."data_conflicts" USING "btree" ("conflict_type");



CREATE INDEX "idx_data_conflicts_product_id" ON "public"."data_conflicts" USING "btree" ("product_id");



CREATE INDEX "idx_data_conflicts_resolution" ON "public"."data_conflicts" USING "btree" ("resolution");



CREATE INDEX "idx_data_conflicts_timestamp" ON "public"."data_conflicts" USING "btree" ("timestamp");



CREATE INDEX "idx_fulfillments_order_id" ON "public"."fulfillments" USING "btree" ("order_id");



CREATE INDEX "idx_fulfillments_printful_order_id" ON "public"."fulfillments" USING "btree" ("printful_order_id");



CREATE INDEX "idx_fulfillments_status" ON "public"."fulfillments" USING "btree" ("status");



CREATE INDEX "idx_idempotency_keys_expires_at" ON "public"."idempotency_keys" USING "btree" ("expires_at");



CREATE INDEX "idx_idempotency_keys_key" ON "public"."idempotency_keys" USING "btree" ("key");



CREATE INDEX "idx_inventory_changes_change_type" ON "public"."inventory_changes" USING "btree" ("change_type");



CREATE INDEX "idx_inventory_changes_processed" ON "public"."inventory_changes" USING "btree" ("processed");



CREATE INDEX "idx_inventory_changes_product_id" ON "public"."inventory_changes" USING "btree" ("product_id");



CREATE INDEX "idx_inventory_changes_timestamp" ON "public"."inventory_changes" USING "btree" ("timestamp");



CREATE INDEX "idx_inventory_changes_variant_id" ON "public"."inventory_changes" USING "btree" ("variant_id");



CREATE INDEX "idx_newsletter_subscribers_email" ON "public"."newsletter_subscribers" USING "btree" ("email");



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_timestamp" ON "public"."notifications" USING "btree" ("timestamp");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_product_images_order" ON "public"."product_images" USING "btree" ("image_order");



CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_product_overrides_printful_id" ON "public"."product_overrides" USING "btree" ("printful_product_id");



CREATE INDEX "idx_product_overrides_product_id" ON "public"."product_overrides" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_available" ON "public"."product_variants" USING "btree" ("is_available");



CREATE INDEX "idx_product_variants_printful_id" ON "public"."product_variants" USING "btree" ("printful_variant_id");



CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_products_available" ON "public"."products" USING "btree" ("is_available");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");



CREATE INDEX "idx_products_printful_id" ON "public"."products" USING "btree" ("printful_product_id");



CREATE INDEX "idx_products_sync_id" ON "public"."products" USING "btree" ("printful_sync_product_id");



CREATE INDEX "idx_sync_errors_resolved" ON "public"."sync_errors" USING "btree" ("resolved");



CREATE INDEX "idx_sync_errors_severity" ON "public"."sync_errors" USING "btree" ("severity");



CREATE INDEX "idx_sync_errors_timestamp" ON "public"."sync_errors" USING "btree" ("timestamp");



CREATE INDEX "idx_sync_errors_type" ON "public"."sync_errors" USING "btree" ("type");



CREATE INDEX "idx_sync_status_product_id" ON "public"."sync_status" USING "btree" ("product_id");



CREATE INDEX "idx_sync_status_timestamp" ON "public"."sync_status" USING "btree" ("timestamp");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_webhook_events_created_at" ON "public"."webhook_events" USING "btree" ("created_at");



CREATE INDEX "idx_webhook_events_event_type" ON "public"."webhook_events" USING "btree" ("event_type");



CREATE INDEX "idx_webhook_events_processed" ON "public"."webhook_events" USING "btree" ("processed");



CREATE INDEX "idx_webhook_events_source" ON "public"."webhook_events" USING "btree" ("source");



CREATE INDEX "idx_webhook_logs_timestamp" ON "public"."webhook_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_webhook_logs_type" ON "public"."webhook_logs" USING "btree" ("type");



CREATE INDEX "idx_webhook_logs_webhook_type" ON "public"."webhook_logs" USING "btree" ("webhook_type");



CREATE OR REPLACE TRIGGER "trigger_update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_products_updated_at"();



CREATE OR REPLACE TRIGGER "update_data_conflicts_updated_at" BEFORE UPDATE ON "public"."data_conflicts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_fulfillments_updated_at" BEFORE UPDATE ON "public"."fulfillments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_variants_updated_at"();



CREATE OR REPLACE TRIGGER "update_webhook_events_updated_at" BEFORE UPDATE ON "public"."webhook_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_admin_role_id_fkey" FOREIGN KEY ("admin_role_id") REFERENCES "public"."admin_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."admin_permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bundle_items"
    ADD CONSTRAINT "bundle_items_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bundle_items"
    ADD CONSTRAINT "bundle_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."data_conflicts"
    ADD CONSTRAINT "data_conflicts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."fulfillments"
    ADD CONSTRAINT "fulfillments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_overrides"
    ADD CONSTRAINT "product_overrides_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_status"
    ADD CONSTRAINT "sync_status_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin users can manage all notifications" ON "public"."notifications" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admin users can manage data conflicts" ON "public"."data_conflicts" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admin users can manage inventory changes" ON "public"."inventory_changes" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admin users can manage sync errors" ON "public"."sync_errors" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admin users can manage webhook logs" ON "public"."webhook_logs" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all on bundle_items" ON "public"."bundle_items" USING (true);



CREATE POLICY "Allow all on bundles" ON "public"."bundles" USING (true);



CREATE POLICY "Allow all on customer_profiles" ON "public"."customer_profiles" USING (true);



CREATE POLICY "Allow all on newsletter_subscribers" ON "public"."newsletter_subscribers" USING (true);



CREATE POLICY "Allow all on order_items" ON "public"."order_items" USING (true);



CREATE POLICY "Allow all on orders" ON "public"."orders" USING (true);



CREATE POLICY "Allow all on product_images" ON "public"."product_images" USING (true);



CREATE POLICY "Allow all on product_overrides" ON "public"."product_overrides" USING (true);



CREATE POLICY "Allow all on products" ON "public"."products" USING (true);



CREATE POLICY "Allow all on sync_status" ON "public"."sync_status" USING (true);



CREATE POLICY "Allow all on user_preferences" ON "public"."user_preferences" USING (true);



CREATE POLICY "Enable all access for service role" ON "public"."product_variants" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Enable delete for authenticated users only" ON "public"."products" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."products" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Service role can access fulfillments" ON "public"."fulfillments" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can access idempotency_keys" ON "public"."idempotency_keys" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can access webhook_events" ON "public"."webhook_events" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view data conflicts" ON "public"."data_conflicts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view inventory changes" ON "public"."inventory_changes" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view sync errors" ON "public"."sync_errors" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view webhook logs" ON "public"."webhook_logs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."bundle_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bundles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."data_conflicts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fulfillments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."idempotency_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_changes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_errors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."check_admin_permission"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_admin_permission"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_admin_permission"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_idempotency_keys"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_idempotency_keys"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_idempotency_keys"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_sync_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_sync_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_sync_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_acquisition_trends"("days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_acquisition_trends"("days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_acquisition_trends"("days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_orders_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_orders_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_orders_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_revenue_trends"("days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_revenue_trends"("days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_revenue_trends"("days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_products"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_products"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_products"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_admin_role"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_admin_role"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_admin_role"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_variants_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_variants_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_variants_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sync_status"("p_is_connected" boolean, "p_last_sync" timestamp with time zone, "p_last_sync_status" "text", "p_sync_progress" integer, "p_is_syncing" boolean, "p_connection_health" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_sync_status"("p_is_connected" boolean, "p_last_sync" timestamp with time zone, "p_last_sync_status" "text", "p_sync_progress" integer, "p_is_syncing" boolean, "p_connection_health" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sync_status"("p_is_connected" boolean, "p_last_sync" timestamp with time zone, "p_last_sync_status" "text", "p_sync_progress" integer, "p_is_syncing" boolean, "p_connection_health" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_permissions" TO "anon";
GRANT ALL ON TABLE "public"."admin_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."admin_role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_roles" TO "anon";
GRANT ALL ON TABLE "public"."admin_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_roles" TO "service_role";



GRANT ALL ON TABLE "public"."bundle_items" TO "anon";
GRANT ALL ON TABLE "public"."bundle_items" TO "authenticated";
GRANT ALL ON TABLE "public"."bundle_items" TO "service_role";



GRANT ALL ON TABLE "public"."bundles" TO "anon";
GRANT ALL ON TABLE "public"."bundles" TO "authenticated";
GRANT ALL ON TABLE "public"."bundles" TO "service_role";



GRANT ALL ON TABLE "public"."customer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."customer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."data_conflicts" TO "anon";
GRANT ALL ON TABLE "public"."data_conflicts" TO "authenticated";
GRANT ALL ON TABLE "public"."data_conflicts" TO "service_role";



GRANT ALL ON TABLE "public"."fulfillments" TO "anon";
GRANT ALL ON TABLE "public"."fulfillments" TO "authenticated";
GRANT ALL ON TABLE "public"."fulfillments" TO "service_role";



GRANT ALL ON TABLE "public"."idempotency_keys" TO "anon";
GRANT ALL ON TABLE "public"."idempotency_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."idempotency_keys" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_changes" TO "anon";
GRANT ALL ON TABLE "public"."inventory_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_changes" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_overrides" TO "anon";
GRANT ALL ON TABLE "public"."product_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."product_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."sync_errors" TO "anon";
GRANT ALL ON TABLE "public"."sync_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_errors" TO "service_role";



GRANT ALL ON TABLE "public"."sync_status" TO "anon";
GRANT ALL ON TABLE "public"."sync_status" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_status" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_logs" TO "anon";
GRANT ALL ON TABLE "public"."webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_logs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
