SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_permissions" ("id", "name", "description", "resource", "action", "created_at") VALUES
	('cfbf51db-1ab0-4a57-a923-6bcb56b412a7', 'view_orders', 'View all orders', 'orders', 'read', '2025-09-01 00:07:59.031195+00'),
	('a4e7a8b6-8a38-4e2c-abfa-aceeab1722e3', 'manage_orders', 'Update order statuses', 'orders', 'write', '2025-09-01 00:07:59.031195+00'),
	('1ca92bb4-48ba-46fc-931e-e6e3c3c3f6c2', 'view_customers', 'View customer profiles', 'customers', 'read', '2025-09-01 00:07:59.031195+00'),
	('55284435-6a68-4e98-ad2d-96542d3da96b', 'manage_customers', 'Edit customer information', 'customers', 'write', '2025-09-01 00:07:59.031195+00'),
	('ba5da3c4-d18a-41c0-bc60-0348e3410f34', 'view_analytics', 'View business analytics', 'analytics', 'read', '2025-09-01 00:07:59.031195+00'),
	('c215b749-5af0-493f-9c45-2ce247561cf0', 'view_settings', 'View admin settings', 'settings', 'read', '2025-09-01 00:07:59.031195+00'),
	('dae5ddbc-3c30-4d88-b859-e55e3be62d58', 'manage_settings', 'Update admin settings', 'settings', 'write', '2025-09-01 00:07:59.031195+00'),
	('ed1d1a71-9d33-4d17-900b-150a0de5b805', 'admin_access', 'Full admin access', 'all', 'all', '2025-09-01 00:07:59.031195+00'),
	('99818d2d-767d-4f31-9a04-94e2c7574793', 'manage_products', 'Full access to manage products', 'products', 'all', '2025-09-01 00:07:59.306613+00'),
	('9c73a23d-8449-42b4-a241-6421ba4b3067', 'manage_bundles', 'Full access to manage bundles', 'bundles', 'all', '2025-09-01 00:07:59.306613+00'),
	('75a20858-5bb7-40cd-8f32-3284afd3d7de', 'manage_images', 'Full access to manage product images', 'product_images', 'all', '2025-09-01 00:07:59.306613+00'),
	('8efe6cce-4992-4ddf-bb1e-34710f67dc69', 'sync_printful', 'Full access to Printful sync operations', 'sync_status', 'all', '2025-09-01 00:07:59.306613+00');


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bundle_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: customer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: data_conflicts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: fulfillments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: idempotency_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: inventory_changes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sync_errors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sync_status; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: webhook_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: webhook_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

RESET ALL;
