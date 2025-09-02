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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_permissions" ("id", "name", "description", "resource", "action", "created_at") VALUES
	('94c15eed-76d0-4a52-8caa-f794b6a96a3f', 'view_orders', 'View all orders', 'orders', 'read', '2025-09-01 02:13:08.815494+00'),
	('ec58f2c0-32e4-45a1-b832-97f4002b87cd', 'manage_orders', 'Update order statuses', 'orders', 'write', '2025-09-01 02:13:08.815494+00'),
	('dbcba971-0599-4957-879f-8a5fc67ebcc7', 'view_customers', 'View customer profiles', 'customers', 'read', '2025-09-01 02:13:08.815494+00'),
	('d982a140-cdec-4f95-819b-916ef85e1778', 'manage_customers', 'Edit customer information', 'customers', 'write', '2025-09-01 02:13:08.815494+00'),
	('6ba1a842-a536-49dc-ad00-de424d7fb48f', 'view_analytics', 'View business analytics', 'analytics', 'read', '2025-09-01 02:13:08.815494+00'),
	('4fd75dea-a5c1-4919-978f-a4d37d41a9f7', 'view_settings', 'View admin settings', 'settings', 'read', '2025-09-01 02:13:08.815494+00'),
	('eb5166f9-a22b-4e96-aac0-a47d35272257', 'manage_settings', 'Update admin settings', 'settings', 'write', '2025-09-01 02:13:08.815494+00'),
	('b63ead40-31bc-480e-9ff1-b83235a033e3', 'admin_access', 'Full admin access', 'all', 'all', '2025-09-01 02:13:08.815494+00'),
	('c70501b0-226a-4cae-a874-48e4e5f7b901', 'manage_products', 'Full access to manage products', 'products', 'all', '2025-09-01 02:13:09.081162+00'),
	('a93840b0-c72f-407f-a8b4-40d0c07ebc88', 'manage_bundles', 'Full access to manage bundles', 'bundles', 'all', '2025-09-01 02:13:09.081162+00'),
	('b5ae1b59-e7d9-4310-a38b-80cb29d8c560', 'manage_images', 'Full access to manage product images', 'product_images', 'all', '2025-09-01 02:13:09.081162+00'),
	('0f1bcaa4-e51c-44d0-860b-b517fcae3dd0', 'sync_printful', 'Full access to Printful sync operations', 'sync_status', 'all', '2025-09-01 02:13:09.081162+00');


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

INSERT INTO "public"."products" ("id", "name", "description", "price", "image_url", "slug", "category", "tags", "reviews", "rating", "in_stock", "stock_count", "created_at", "updated_at", "printful_product_id", "printful_cost", "retail_price", "is_available", "margin", "metadata", "is_active", "printful_product_id_light", "custom_price", "printful_sync_product_id") VALUES
	('704d146b-5800-4c63-b10b-f24812ec76f9', 'Reform UK Sticker', 'Reform UK branded sticker', 2.99, '/StickerToteWater/ReformStickersMain1.webp', 'reform-uk-sticker', 'gear', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.76+00', '2025-09-01 02:26:49.034745+00', '390637627', 1.79, 2.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('fcc13411-cb4a-4afa-8992-197dd2adf781', 'Reform UK Mug', 'Ceramic mug with Reform UK logo', 9.99, '/MugMouse/ReformMug1.webp', 'reform-uk-mug', 'gear', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.793+00', '2025-09-01 02:26:49.860992+00', '390637302', 5.99, 9.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('d35b4511-7086-463a-acaa-984410987f56', 'Reform UK Mouse Pad', 'Mouse pad with Reform UK branding', 14.99, '/MugMouse/ReformMousePadWhite1.webp', 'reform-uk-mouse-pad', 'gear', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.807+00', '2025-09-01 02:26:50.745795+00', '390637071', 8.99, 14.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('2f997b39-2abe-429d-86ef-b5537a0b2865', 'Reform UK Water Bottle', 'Reusable water bottle with Reform UK logo', 24.99, '/StickerToteWater/ReformWaterBottleWhite1.webp', 'reform-uk-water-bottle', 'gear', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.815+00', '2025-09-01 02:26:51.628559+00', '390636972', 14.99, 24.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', 'Reform UK Cap', 'Adjustable cap with Reform UK logo', 19.99, '/Cap/ReformCapBlue1.webp', 'reform-uk-cap', 'apparel', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.82+00', '2025-09-01 02:26:52.606775+00', '390636644', 11.99, 19.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('5b572776-8f20-4214-9928-2c8fe1081ec9', 'Unisex t-shirt DARK', 'Premium unisex t-shirt with Reform UK branding - Dark colors', 24.99, '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'unisex-t-shirt-dark', 'apparel', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.832+00', '2025-09-01 02:26:54.802192+00', '390630122', 14.99, 24.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('aee9a9a7-ad89-46dc-9646-b37cfd57a99d', 'Unisex t-shirt LIGHT', 'Premium unisex t-shirt with Reform UK branding - Light colors', 24.99, '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'unisex-t-shirt-light', 'apparel', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.837+00', '2025-09-01 02:26:56.716021+00', '390629811', 14.99, 24.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('cefed082-bbf9-4e3f-ad41-98653e3e1d93', 'Unisex Hoodie DARK', 'Premium unisex hoodie with Reform UK branding - Dark colors', 39.99, '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'unisex-hoodie-dark', 'apparel', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.842+00', '2025-09-01 02:26:58.486333+00', '390628740', 23.99, 39.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('51453873-4414-4fbe-8db0-cee194fb2553', 'Unisex Hoodie LIGHT', 'Premium unisex hoodie with Reform UK branding - Light colors', 39.99, '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'unisex-hoodie-light', 'apparel', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.848+00', '2025-09-01 02:26:59.643765+00', '390628620', 23.99, 39.99, true, NULL, '{}', true, NULL, NULL, NULL),
	('73ef8eed-a13b-4e88-8f3c-fa209098489a', 'Reform UK Tote Bag', 'Eco-friendly tote bag with Reform UK branding', 24.99, '/StickerToteWater/ReformToteBagBlack1.webp', 'reform-uk-tote-bag', 'gear', '{printful-sync}', 0, 4.50, true, 0, '2025-09-01 02:14:08.853+00', '2025-09-01 02:27:00.561166+00', '390552402', 14.99, 24.99, true, NULL, '{}', true, NULL, NULL, NULL);


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

INSERT INTO "public"."product_variants" ("id", "product_id", "printful_variant_id", "name", "value", "color", "size", "price", "in_stock", "is_available", "created_at", "updated_at", "color_code", "stock", "printful_data", "color_hex") VALUES
	('dbd1bbbe-0601-4b11-93c6-16752860b125', 'fcc13411-cb4a-4afa-8992-197dd2adf781', '4938946337', 'Reform UK Mug', 'Default', 'Default', NULL, 9.99, true, true, '2025-09-01 02:14:26.576443+00', '2025-09-01 02:26:49.876473+00', NULL, 0, NULL, '#000000'),
	('1ab791d1-08f1-4cd3-bbdd-141941b0c50c', 'd35b4511-7086-463a-acaa-984410987f56', '4938942751', 'Reform UK Mouse Pad', 'Default', 'Default', NULL, 14.99, true, true, '2025-09-01 02:14:26.57441+00', '2025-09-01 02:26:50.755341+00', NULL, 0, NULL, '#000000'),
	('2c82a13b-2e4d-45a7-b173-6e8d8df03af3', '2f997b39-2abe-429d-86ef-b5537a0b2865', '4938941055', 'Reform UK Water Bottle', 'Default', 'Default', NULL, 24.99, true, true, '2025-09-01 02:14:26.582431+00', '2025-09-01 02:26:51.635399+00', NULL, 0, NULL, '#000000'),
	('1f8b6b10-3912-4b68-97af-cfdad600e5d9', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937571', 'Reform UK Cap / Black', 'Black', 'Black', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.546856+00', '2025-09-01 02:26:52.615976+00', NULL, 0, NULL, '#000000'),
	('29d447f6-fde3-4805-9b5f-de92ce9575a4', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937572', 'Reform UK Cap / Navy', 'Navy', 'Navy', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.553132+00', '2025-09-01 02:26:52.619564+00', NULL, 0, NULL, '#000000'),
	('2c92fb2d-3d5c-42e7-a8ce-507c7d84af1c', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937573', 'Reform UK Cap / Dark Grey', 'Dark Grey', 'Dark Grey', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.556013+00', '2025-09-01 02:26:52.624283+00', NULL, 0, NULL, '#000000'),
	('3d1dead1-6f27-423d-b3e0-3c9a76f5f20e', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937574', 'Reform UK Cap / Khaki', 'Khaki', 'Khaki', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.563196+00', '2025-09-01 02:26:52.627642+00', NULL, 0, NULL, '#000000'),
	('3f259283-bad2-4dcc-89e2-49347338c3ef', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937575', 'Reform UK Cap / Stone', 'Stone', 'Stone', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.558357+00', '2025-09-01 02:26:52.631592+00', NULL, 0, NULL, '#000000'),
	('7b2493a7-a3bd-415e-a397-e00d44ab04ec', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937576', 'Reform UK Cap / Pink', 'Pink', 'Pink', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.570947+00', '2025-09-01 02:26:52.634336+00', NULL, 0, NULL, '#000000'),
	('c3a1cfb4-c73e-4e56-9b45-0d97de95855b', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937577', 'Reform UK Cap / Light Blue', 'Light Blue', 'Light Blue', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.561026+00', '2025-09-01 02:26:52.636205+00', NULL, 0, NULL, '#000000'),
	('e2a46220-acf0-484c-b88c-e6202373f910', '02526dd2-fbf6-4c0a-b5d6-da35b00f99e3', '4938937578', 'Reform UK Cap / White', 'White', 'White', 'One Size', 19.99, true, true, '2025-09-01 02:14:26.565596+00', '2025-09-01 02:26:52.638721+00', NULL, 0, NULL, '#000000'),
	('042b67de-1ddb-4f28-a11a-18abc7e42ccd', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800533', 'Unisex Hoodie DARK / Black / S', 'Black-S', 'Black', 'S', 39.99, true, true, '2025-09-01 02:14:26.608424+00', '2025-09-01 02:26:58.497217+00', NULL, 0, NULL, '#000000'),
	('139aae81-d2a1-437c-b572-301b8681540c', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800534', 'Unisex Hoodie DARK / Black / M', 'Black-M', 'Black', 'M', 39.99, true, true, '2025-09-01 02:14:26.607244+00', '2025-09-01 02:26:58.501841+00', NULL, 0, NULL, '#000000'),
	('244e7b13-2548-4cb7-be1a-6c427530aae1', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800535', 'Unisex Hoodie DARK / Black / L', 'Black-L', 'Black', 'L', 39.99, true, true, '2025-09-01 02:14:26.60611+00', '2025-09-01 02:26:58.506047+00', NULL, 0, NULL, '#000000'),
	('2a63b67f-45f0-4f24-876a-6f51f0388f02', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800536', 'Unisex Hoodie DARK / Black / XL', 'Black-XL', 'Black', 'XL', 39.99, true, true, '2025-09-01 02:14:26.611008+00', '2025-09-01 02:26:58.509218+00', NULL, 0, NULL, '#000000'),
	('5a773791-fd25-48ca-a2c1-687c1ebc5415', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800538', 'Unisex Hoodie DARK / Navy / S', 'Navy-S', 'Navy', 'S', 39.99, true, true, '2025-09-01 02:14:26.618251+00', '2025-09-01 02:26:58.514952+00', NULL, 0, NULL, '#000000'),
	('5f4260c6-7476-4b28-9218-e06ded2f07f0', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800539', 'Unisex Hoodie DARK / Navy / M', 'Navy-M', 'Navy', 'M', 39.99, true, true, '2025-09-01 02:14:26.602512+00', '2025-09-01 02:26:58.517273+00', NULL, 0, NULL, '#000000'),
	('6f4e32f4-5635-40cb-ab91-07ff9a3bee69', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800540', 'Unisex Hoodie DARK / Navy / L', 'Navy-L', 'Navy', 'L', 39.99, true, true, '2025-09-01 02:14:26.587154+00', '2025-09-01 02:26:58.520037+00', NULL, 0, NULL, '#000000'),
	('7c5f4385-8b64-4ca6-a1cd-847f238d6272', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800541', 'Unisex Hoodie DARK / Navy / XL', 'Navy-XL', 'Navy', 'XL', 39.99, true, true, '2025-09-01 02:14:26.597536+00', '2025-09-01 02:26:58.522575+00', NULL, 0, NULL, '#000000'),
	('8d1661b2-bcbe-4d9b-bd9e-9d4b9c27ea93', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800542', 'Unisex Hoodie DARK / Navy / 2XL', 'Navy-2XL', 'Navy', '2XL', 39.99, true, true, '2025-09-01 02:14:26.584036+00', '2025-09-01 02:26:58.524775+00', NULL, 0, NULL, '#000000'),
	('9314015a-6c50-4c70-8fab-217c08bee348', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800543', 'Unisex Hoodie DARK / Red / S', 'Red-S', 'Red', 'S', 39.99, true, true, '2025-09-01 02:14:26.593104+00', '2025-09-01 02:26:58.526822+00', NULL, 0, NULL, '#000000'),
	('9de08c1a-1d8c-4da4-bff6-8e7b6c035eaf', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800544', 'Unisex Hoodie DARK / Red / M', 'Red-M', 'Red', 'M', 39.99, true, true, '2025-09-01 02:14:26.612073+00', '2025-09-01 02:26:58.528609+00', NULL, 0, NULL, '#000000'),
	('9f933d01-05be-4d83-b002-7dd2cf55155f', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800545', 'Unisex Hoodie DARK / Red / L', 'Red-L', 'Red', 'L', 39.99, true, true, '2025-09-01 02:14:26.613215+00', '2025-09-01 02:26:58.530947+00', NULL, 0, NULL, '#000000'),
	('a2718914-83c7-400d-9fe2-c6634d9a442d', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800546', 'Unisex Hoodie DARK / Red / XL', 'Red-XL', 'Red', 'XL', 39.99, true, true, '2025-09-01 02:14:26.594606+00', '2025-09-01 02:26:58.53237+00', NULL, 0, NULL, '#000000'),
	('ac520d08-3061-4395-84b1-f35ee982dae0', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800547', 'Unisex Hoodie DARK / Red / 2XL', 'Red-2XL', 'Red', '2XL', 39.99, true, true, '2025-09-01 02:14:26.61955+00', '2025-09-01 02:26:58.533931+00', NULL, 0, NULL, '#000000'),
	('b0db3372-3413-4748-98d1-89018c87e94d', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800548', 'Unisex Hoodie DARK / Dark Heather / S', 'Dark Heather-S', 'Dark Heather', 'S', 39.99, true, true, '2025-09-01 02:14:26.590979+00', '2025-09-01 02:26:58.535809+00', NULL, 0, NULL, '#000000'),
	('bb1de23e-f316-4c66-83a2-ff6f61bbca75', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800549', 'Unisex Hoodie DARK / Dark Heather / M', 'Dark Heather-M', 'Dark Heather', 'M', 39.99, true, true, '2025-09-01 02:14:26.598859+00', '2025-09-01 02:26:58.537169+00', NULL, 0, NULL, '#000000'),
	('c0c3a603-30e6-400a-ab16-579c0f9f59f3', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800550', 'Unisex Hoodie DARK / Dark Heather / L', 'Dark Heather-L', 'Dark Heather', 'L', 39.99, true, true, '2025-09-01 02:14:26.585788+00', '2025-09-01 02:26:58.538461+00', NULL, 0, NULL, '#000000'),
	('c5456f98-c3f4-4de3-a40d-166c606e1bc5', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800551', 'Unisex Hoodie DARK / Dark Heather / XL', 'Dark Heather-XL', 'Dark Heather', 'XL', 39.99, true, true, '2025-09-01 02:14:26.614694+00', '2025-09-01 02:26:58.539669+00', NULL, 0, NULL, '#000000'),
	('c83d2583-c971-4b83-b832-a53a09e04c78', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800552', 'Unisex Hoodie DARK / Dark Heather / 2XL', 'Dark Heather-2XL', 'Dark Heather', '2XL', 39.99, true, true, '2025-09-01 02:14:26.603672+00', '2025-09-01 02:26:58.541215+00', NULL, 0, NULL, '#000000'),
	('e05d7b4b-396d-4914-9fe0-2face444f2bc', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800554', 'Unisex Hoodie DARK / Indigo Blue / M', 'Indigo Blue-M', 'Indigo Blue', 'M', 39.99, true, true, '2025-09-01 02:14:26.601341+00', '2025-09-01 02:26:58.544165+00', NULL, 0, NULL, '#000000'),
	('ead2bd75-68fa-45ca-9cd0-bda370491664', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800555', 'Unisex Hoodie DARK / Indigo Blue / L', 'Indigo Blue-L', 'Indigo Blue', 'L', 39.99, true, true, '2025-09-01 02:14:26.609738+00', '2025-09-01 02:26:58.545631+00', NULL, 0, NULL, '#000000'),
	('f29605e8-3dad-41eb-ad36-0e72bc172bb7', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800556', 'Unisex Hoodie DARK / Indigo Blue / XL', 'Indigo Blue-XL', 'Indigo Blue', 'XL', 39.99, true, true, '2025-09-01 02:14:26.600076+00', '2025-09-01 02:26:58.547109+00', NULL, 0, NULL, '#000000'),
	('fb8899c0-4edd-40ab-98d2-b31e3f253ca7', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800557', 'Unisex Hoodie DARK / Indigo Blue / 2XL', 'Indigo Blue-2XL', 'Indigo Blue', '2XL', 39.99, true, true, '2025-09-01 02:14:26.6161+00', '2025-09-01 02:26:58.548668+00', NULL, 0, NULL, '#000000'),
	('39204b5a-2b8e-4526-9ddb-661ce3f504b8', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797545', 'Unisex Hoodie LIGHT / Sport Grey / S', 'Sport Grey-S', 'Sport Grey', 'S', 39.99, true, true, '2025-09-01 02:14:26.623149+00', '2025-09-01 02:26:59.649423+00', NULL, 0, NULL, '#000000'),
	('524a8dc9-5c7d-4da5-a7d7-5584356ff305', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797546', 'Unisex Hoodie LIGHT / Sport Grey / M', 'Sport Grey-M', 'Sport Grey', 'M', 39.99, true, true, '2025-09-01 02:14:26.63473+00', '2025-09-01 02:26:59.652218+00', NULL, 0, NULL, '#000000'),
	('572b9f08-6d2d-4fa9-9fd7-8d7b362bf844', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797547', 'Unisex Hoodie LIGHT / Sport Grey / L', 'Sport Grey-L', 'Sport Grey', 'L', 39.99, true, true, '2025-09-01 02:14:26.625539+00', '2025-09-01 02:26:59.65427+00', NULL, 0, NULL, '#000000'),
	('73a5f4a8-d6f6-41c2-a525-9f627b2b1ebd', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797551', 'Unisex Hoodie LIGHT / Light Blue / M', 'Light Blue-M', 'Light Blue', 'M', 39.99, true, true, '2025-09-01 02:14:26.633527+00', '2025-09-01 02:26:59.660614+00', NULL, 0, NULL, '#000000'),
	('7597939c-2f9b-4114-a207-7e33e8c59aeb', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797553', 'Unisex Hoodie LIGHT / Light Blue / XL', 'Light Blue-XL', 'Light Blue', 'XL', 39.99, true, true, '2025-09-01 02:14:26.637455+00', '2025-09-01 02:26:59.663331+00', NULL, 0, NULL, '#000000'),
	('86e27ac5-1e7a-484a-8448-08bbdeff4a29', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797555', 'Unisex Hoodie LIGHT / Light Pink / S', 'Light Pink-S', 'Light Pink', 'S', 39.99, true, true, '2025-09-01 02:14:26.631928+00', '2025-09-01 02:26:59.666232+00', NULL, 0, NULL, '#000000'),
	('a966d180-036b-44ed-bd12-7a5888ca11f3', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797556', 'Unisex Hoodie LIGHT / Light Pink / M', 'Light Pink-M', 'Light Pink', 'M', 39.99, true, true, '2025-09-01 02:14:26.620956+00', '2025-09-01 02:26:59.667438+00', NULL, 0, NULL, '#000000'),
	('b29208b0-cb9b-4817-b168-6b6c9e69ddb7', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797558', 'Unisex Hoodie LIGHT / Light Pink / XL', 'Light Pink-XL', 'Light Pink', 'XL', 39.99, true, true, '2025-09-01 02:14:26.636152+00', '2025-09-01 02:26:59.669996+00', NULL, 0, NULL, '#000000'),
	('cdecea5b-7efc-4a83-86c3-4f9cce8cc2e3', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797559', 'Unisex Hoodie LIGHT / Light Pink / 2XL', 'Light Pink-2XL', 'Light Pink', '2XL', 39.99, true, true, '2025-09-01 02:14:26.638828+00', '2025-09-01 02:26:59.671242+00', NULL, 0, NULL, '#000000'),
	('b385e718-1468-4cc7-8177-716d975e0f88', '73ef8eed-a13b-4e88-8f3c-fa209098489a', '4937855201', 'Reform UK Tote Bag', 'Default', 'Default', NULL, 24.99, true, true, '2025-09-01 02:14:26.580777+00', '2025-09-01 02:27:00.568972+00', NULL, 0, NULL, '#000000'),
	('06fa2123-5fa2-4d27-9f6a-a5ba2356f281', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821283', 'Unisex t-shirt DARK / Black Heather / M', 'Black Heather-M', 'Black Heather', 'M', 24.99, true, true, '2025-09-01 02:14:26.715342+00', '2025-09-01 02:26:54.824717+00', NULL, 0, NULL, '#000000'),
	('0b3262f9-e81e-449e-ae9d-14a43987a453', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821284', 'Unisex t-shirt DARK / Black Heather / L', 'Black Heather-L', 'Black Heather', 'L', 24.99, true, true, '2025-09-01 02:14:26.682726+00', '2025-09-01 02:26:54.82891+00', NULL, 0, NULL, '#000000'),
	('137ee871-fbe2-4577-a7b4-f43856d0ba13', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821287', 'Unisex t-shirt DARK / Black / S', 'Black-S', 'Black', 'S', 24.99, true, true, '2025-09-01 02:14:26.709148+00', '2025-09-01 02:26:54.836775+00', NULL, 0, NULL, '#000000'),
	('159517bd-2f64-47d2-9187-56f93725e1a9', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821288', 'Unisex t-shirt DARK / Black / M', 'Black-M', 'Black', 'M', 24.99, true, true, '2025-09-01 02:14:26.689794+00', '2025-09-01 02:26:54.838724+00', NULL, 0, NULL, '#000000'),
	('24bc568b-4abc-452a-ad32-8954ade7f512', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821289', 'Unisex t-shirt DARK / Black / L', 'Black-L', 'Black', 'L', 24.99, true, true, '2025-09-01 02:14:26.681+00', '2025-09-01 02:26:54.841207+00', NULL, 0, NULL, '#000000'),
	('2f58afd3-8af0-4140-904f-dcd3b7f40484', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821291', 'Unisex t-shirt DARK / Black / 2XL', 'Black-2XL', 'Black', '2XL', 24.99, true, true, '2025-09-01 02:14:26.669703+00', '2025-09-01 02:26:54.845969+00', NULL, 0, NULL, '#000000'),
	('31756562-98b5-48fc-9ec2-05d89fe4b7ec', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821292', 'Unisex t-shirt DARK / Navy / S', 'Navy-S', 'Navy', 'S', 24.99, true, true, '2025-09-01 02:14:26.686849+00', '2025-09-01 02:26:54.848446+00', NULL, 0, NULL, '#000000'),
	('4be7fe49-4581-4b0b-af08-1df914fea143', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821295', 'Unisex t-shirt DARK / Navy / XL', 'Navy-XL', 'Navy', 'XL', 24.99, true, true, '2025-09-01 02:14:26.722506+00', '2025-09-01 02:26:54.855668+00', NULL, 0, NULL, '#000000'),
	('4f2e831d-f725-457d-a2da-b76979d1249d', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821297', 'Unisex t-shirt DARK / Red / S', 'Red-S', 'Red', 'S', 24.99, true, true, '2025-09-01 02:14:26.684008+00', '2025-09-01 02:26:54.859483+00', NULL, 0, NULL, '#000000'),
	('540dd228-a0bf-4912-a0b1-563ef7f95cdd', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821298', 'Unisex t-shirt DARK / Red / M', 'Red-M', 'Red', 'M', 24.99, true, true, '2025-09-01 02:14:26.71896+00', '2025-09-01 02:26:54.861989+00', NULL, 0, NULL, '#000000'),
	('5b1267bf-b3c2-4a5e-8f7c-2f79290b7bda', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821300', 'Unisex t-shirt DARK / Red / XL', 'Red-XL', 'Red', 'XL', 24.99, true, true, '2025-09-01 02:14:26.664942+00', '2025-09-01 02:26:54.866605+00', NULL, 0, NULL, '#000000'),
	('5c3c1139-77d1-4806-bb34-cc1a16003942', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821301', 'Unisex t-shirt DARK / Red / 2XL', 'Red-2XL', 'Red', '2XL', 24.99, true, true, '2025-09-01 02:14:26.710357+00', '2025-09-01 02:26:54.868874+00', NULL, 0, NULL, '#000000'),
	('5fec77f5-b56c-4e03-865d-48af5d29d2fa', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821302', 'Unisex t-shirt DARK / Dark Grey Heather / S', 'Dark Grey Heather-S', 'Dark Grey Heather', 'S', 24.99, true, true, '2025-09-01 02:14:26.668093+00', '2025-09-01 02:26:54.870584+00', NULL, 0, NULL, '#000000'),
	('638c14de-0963-4c35-bd52-757a66b621b7', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821303', 'Unisex t-shirt DARK / Dark Grey Heather / M', 'Dark Grey Heather-M', 'Dark Grey Heather', 'M', 24.99, true, true, '2025-09-01 02:14:26.70034+00', '2025-09-01 02:26:54.87236+00', NULL, 0, NULL, '#000000'),
	('6d2f0a6d-a4ff-416a-8545-cfdb4926f447', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821304', 'Unisex t-shirt DARK / Dark Grey Heather / L', 'Dark Grey Heather-L', 'Dark Grey Heather', 'L', 24.99, true, true, '2025-09-01 02:14:26.717822+00', '2025-09-01 02:26:54.874157+00', NULL, 0, NULL, '#000000'),
	('71fa9729-0f20-4a1a-85e8-5ff399d9e873', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821305', 'Unisex t-shirt DARK / Dark Grey Heather / XL', 'Dark Grey Heather-XL', 'Dark Grey Heather', 'XL', 24.99, true, true, '2025-09-01 02:14:26.719985+00', '2025-09-01 02:26:54.876468+00', NULL, 0, NULL, '#000000'),
	('767f6aa1-6eff-4ea0-894c-14114382122b', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821307', 'Unisex t-shirt DARK / Asphalt / S', 'Asphalt-S', 'Asphalt', 'S', 24.99, true, true, '2025-09-01 02:14:26.677697+00', '2025-09-01 02:26:54.879994+00', NULL, 0, NULL, '#000000'),
	('8d2cb983-476c-44b2-b380-34a551137fef', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821310', 'Unisex t-shirt DARK / Asphalt / XL', 'Asphalt-XL', 'Asphalt', 'XL', 24.99, true, true, '2025-09-01 02:14:26.716662+00', '2025-09-01 02:26:54.884406+00', NULL, 0, NULL, '#000000'),
	('8fcb8798-0786-46b9-88a2-6c1276479b46', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821312', 'Unisex t-shirt DARK / Army / S', 'Army-S', 'Army', 'S', 24.99, true, true, '2025-09-01 02:14:26.674929+00', '2025-09-01 02:26:54.887107+00', NULL, 0, NULL, '#000000'),
	('905d4ecb-2be3-4b57-8793-45a69f5e161f', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821313', 'Unisex t-shirt DARK / Army / M', 'Army-M', 'Army', 'M', 24.99, true, true, '2025-09-01 02:14:26.713988+00', '2025-09-01 02:26:54.888382+00', NULL, 0, NULL, '#000000'),
	('90c617ce-210f-45cb-ba6a-2442f7f1a4d8', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821314', 'Unisex t-shirt DARK / Army / L', 'Army-L', 'Army', 'L', 24.99, true, true, '2025-09-01 02:14:26.707905+00', '2025-09-01 02:26:54.889626+00', NULL, 0, NULL, '#000000'),
	('b21e0965-6232-4673-bd77-b22dcee5a4c1', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821318', 'Unisex t-shirt DARK / Olive / M', 'Olive-M', 'Olive', 'M', 24.99, true, true, '2025-09-01 02:14:26.66653+00', '2025-09-01 02:26:54.896676+00', NULL, 0, NULL, '#000000'),
	('b5a7aa54-8f78-4493-87fb-9f2899317b87', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821319', 'Unisex t-shirt DARK / Olive / L', 'Olive-L', 'Olive', 'L', 24.99, true, true, '2025-09-01 02:14:26.696923+00', '2025-09-01 02:26:54.899589+00', NULL, 0, NULL, '#000000'),
	('b6710404-5588-40eb-9ded-ba1760c9a63b', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821320', 'Unisex t-shirt DARK / Olive / XL', 'Olive-XL', 'Olive', 'XL', 24.99, true, true, '2025-09-01 02:14:26.6929+00', '2025-09-01 02:26:54.901155+00', NULL, 0, NULL, '#000000'),
	('d1584223-f8e0-4d78-9a38-d0a643fa53a0', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821324', 'Unisex t-shirt DARK / Autumn / L', 'Autumn-L', 'Autumn', 'L', 24.99, true, true, '2025-09-01 02:14:26.721324+00', '2025-09-01 02:26:54.908596+00', NULL, 0, NULL, '#000000'),
	('d3c283ad-d553-4a57-afd3-aaa6dbfd9264', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821326', 'Unisex t-shirt DARK / Autumn / 2XL', 'Autumn-2XL', 'Autumn', '2XL', 24.99, true, true, '2025-09-01 02:14:26.663454+00', '2025-09-01 02:26:54.911224+00', NULL, 0, NULL, '#000000'),
	('d3e4e0d7-9af9-4aef-88e1-2ddc88540492', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821327', 'Unisex t-shirt DARK / Heather Deep Teal / S', 'Heather Deep Teal-S', 'Heather Deep Teal', 'S', 24.99, true, true, '2025-09-01 02:14:26.704516+00', '2025-09-01 02:26:54.912406+00', NULL, 0, NULL, '#000000'),
	('d8ceba1d-37fa-48fd-b880-a026a6a2b855', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821328', 'Unisex t-shirt DARK / Heather Deep Teal / M', 'Heather Deep Teal-M', 'Heather Deep Teal', 'M', 24.99, true, true, '2025-09-01 02:14:26.685289+00', '2025-09-01 02:26:54.913571+00', NULL, 0, NULL, '#000000'),
	('df876eb3-ca01-49f3-8c8e-33e15c8604a5', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821331', 'Unisex t-shirt DARK / Heather Deep Teal / 2XL', 'Heather Deep Teal-2XL', 'Heather Deep Teal', '2XL', 24.99, true, true, '2025-09-01 02:14:26.662124+00', '2025-09-01 02:26:54.916992+00', NULL, 0, NULL, '#000000'),
	('e499f8e9-a32a-45ba-8668-d80da35f6a61', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821333', 'Unisex t-shirt DARK / Mauve / M', 'Mauve-M', 'Mauve', 'M', 24.99, true, true, '2025-09-01 02:14:26.723533+00', '2025-09-01 02:26:54.919375+00', NULL, 0, NULL, '#000000'),
	('eaccb75c-3af9-4c6e-8e7d-c7b5b9f67e06', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821336', 'Unisex t-shirt DARK / Mauve / 2XL', 'Mauve-2XL', 'Mauve', '2XL', 24.99, true, true, '2025-09-01 02:14:26.67642+00', '2025-09-01 02:26:54.924061+00', NULL, 0, NULL, '#000000'),
	('f19df01e-e7a9-47eb-8769-b17f54eba804', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821337', 'Unisex t-shirt DARK / Steel Blue / S', 'Steel Blue-S', 'Steel Blue', 'S', 24.99, true, true, '2025-09-01 02:14:26.673391+00', '2025-09-01 02:26:54.925371+00', NULL, 0, NULL, '#000000'),
	('fbf92aa6-2b72-424a-8c7b-ba13aa16ba4a', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821341', 'Unisex t-shirt DARK / Steel Blue / 2XL', 'Steel Blue-2XL', 'Steel Blue', '2XL', 24.99, true, true, '2025-09-01 02:14:26.712793+00', '2025-09-01 02:26:54.93053+00', NULL, 0, NULL, '#000000'),
	('5792c975-ecb4-41dc-b344-67f3c20b51b3', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797548', 'Unisex Hoodie LIGHT / Sport Grey / XL', 'Sport Grey-XL', 'Sport Grey', 'XL', 39.99, true, true, '2025-09-01 02:14:26.640192+00', '2025-09-01 02:26:59.656237+00', NULL, 0, NULL, '#000000'),
	('694a0d2b-f69a-4c59-bc36-3e699ff41ee7', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797549', 'Unisex Hoodie LIGHT / Sport Grey / 2XL', 'Sport Grey-2XL', 'Sport Grey', '2XL', 39.99, true, true, '2025-09-01 02:14:26.656289+00', '2025-09-01 02:26:59.657929+00', NULL, 0, NULL, '#000000'),
	('6f3c46b8-665e-470b-bde0-21e8e27ec850', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797550', 'Unisex Hoodie LIGHT / Light Blue / S', 'Light Blue-S', 'Light Blue', 'S', 39.99, true, true, '2025-09-01 02:14:26.657848+00', '2025-09-01 02:26:59.659275+00', NULL, 0, NULL, '#000000'),
	('81cadf08-1259-4788-b168-c72be7897322', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797554', 'Unisex Hoodie LIGHT / Light Blue / 2XL', 'Light Blue-2XL', 'Light Blue', '2XL', 39.99, true, true, '2025-09-01 02:14:26.644166+00', '2025-09-01 02:26:59.664858+00', NULL, 0, NULL, '#000000'),
	('cece90ab-d119-4c5a-b186-8f438d104022', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797560', 'Unisex Hoodie LIGHT / White / S', 'White-S', 'White', 'S', 39.99, true, true, '2025-09-01 02:14:26.653827+00', '2025-09-01 02:26:59.672638+00', NULL, 0, NULL, '#000000'),
	('cf66dacb-7907-42b6-8625-467ca92a1a16', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797561', 'Unisex Hoodie LIGHT / White / M', 'White-M', 'White', 'M', 39.99, true, true, '2025-09-01 02:14:26.660733+00', '2025-09-01 02:26:59.673929+00', NULL, 0, NULL, '#000000'),
	('f396ad58-a741-4674-be3c-399eb56f2a8f', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797562', 'Unisex Hoodie LIGHT / White / L', 'White-L', 'White', 'L', 39.99, true, true, '2025-09-01 02:14:26.642444+00', '2025-09-01 02:26:59.6755+00', NULL, 0, NULL, '#000000'),
	('f489ae66-4419-4d56-ae6d-04ebe2e6bfa5', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797563', 'Unisex Hoodie LIGHT / White / XL', 'White-XL', 'White', 'XL', 39.99, true, true, '2025-09-01 02:14:26.648369+00', '2025-09-01 02:26:59.676976+00', NULL, 0, NULL, '#000000'),
	('f7bc6554-4d24-4041-8556-8953cb2fc481', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797564', 'Unisex Hoodie LIGHT / White / 2XL', 'White-2XL', 'White', '2XL', 39.99, true, true, '2025-09-01 02:14:26.659383+00', '2025-09-01 02:26:59.678672+00', NULL, 0, NULL, '#000000'),
	('12e5a45c-560f-49fe-9842-b74a827d878c', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821286', 'Unisex t-shirt DARK / Black Heather / 2XL', 'Black Heather-2XL', 'Black Heather', '2XL', 24.99, true, true, '2025-09-01 02:14:26.745221+00', '2025-09-01 02:26:54.83408+00', NULL, 0, NULL, '#000000'),
	('25e15aaa-b843-43f1-9b11-507582268f36', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821290', 'Unisex t-shirt DARK / Black / XL', 'Black-XL', 'Black', 'XL', 24.99, true, true, '2025-09-01 02:14:26.747126+00', '2025-09-01 02:26:54.84358+00', NULL, 0, NULL, '#000000'),
	('441aa8b9-6883-4127-9a1b-0a1ae5d366d3', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821293', 'Unisex t-shirt DARK / Navy / M', 'Navy-M', 'Navy', 'M', 24.99, true, true, '2025-09-01 02:14:26.753814+00', '2025-09-01 02:26:54.850742+00', NULL, 0, NULL, '#000000'),
	('4cd7cf5a-2ed9-492f-8e13-c386f00059d8', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821296', 'Unisex t-shirt DARK / Navy / 2XL', 'Navy-2XL', 'Navy', '2XL', 24.99, true, true, '2025-09-01 02:14:26.738847+00', '2025-09-01 02:26:54.857479+00', NULL, 0, NULL, '#000000'),
	('5926e38a-08be-445b-9f41-71078e0f92f5', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821299', 'Unisex t-shirt DARK / Red / L', 'Red-L', 'Red', 'L', 24.99, true, true, '2025-09-01 02:14:26.743244+00', '2025-09-01 02:26:54.863889+00', NULL, 0, NULL, '#000000'),
	('80f31426-748b-4162-8372-f9a047780dcd', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821308', 'Unisex t-shirt DARK / Asphalt / M', 'Asphalt-M', 'Asphalt', 'M', 24.99, true, true, '2025-09-01 02:14:26.762917+00', '2025-09-01 02:26:54.881471+00', NULL, 0, NULL, '#000000'),
	('8ba6172f-7ff9-4336-b451-50eca554dcdc', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821309', 'Unisex t-shirt DARK / Asphalt / L', 'Asphalt-L', 'Asphalt', 'L', 24.99, true, true, '2025-09-01 02:14:26.737471+00', '2025-09-01 02:26:54.883077+00', NULL, 0, NULL, '#000000'),
	('8ef09b25-e9d1-4118-9ba6-66b01b75c38a', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821311', 'Unisex t-shirt DARK / Asphalt / 2XL', 'Asphalt-2XL', 'Asphalt', '2XL', 24.99, true, true, '2025-09-01 02:14:26.728698+00', '2025-09-01 02:26:54.885684+00', NULL, 0, NULL, '#000000'),
	('99f62446-33bd-438b-b3f9-82ad9ad69b93', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821315', 'Unisex t-shirt DARK / Army / XL', 'Army-XL', 'Army', 'XL', 24.99, true, true, '2025-09-01 02:14:26.757976+00', '2025-09-01 02:26:54.890798+00', NULL, 0, NULL, '#000000'),
	('b110feb0-6196-4184-bdc3-a45d4cb6e3bf', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821317', 'Unisex t-shirt DARK / Olive / S', 'Olive-S', 'Olive', 'S', 24.99, true, true, '2025-09-01 02:14:26.729974+00', '2025-09-01 02:26:54.893855+00', NULL, 0, NULL, '#000000'),
	('b9ce68a1-4d76-4bb8-a810-1a9933cda46a', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821321', 'Unisex t-shirt DARK / Olive / 2XL', 'Olive-2XL', 'Olive', '2XL', 24.99, true, true, '2025-09-01 02:14:26.749389+00', '2025-09-01 02:26:54.903104+00', NULL, 0, NULL, '#000000'),
	('c0b125a6-e80e-4ab1-a328-efe7d20c00c4', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821322', 'Unisex t-shirt DARK / Autumn / S', 'Autumn-S', 'Autumn', 'S', 24.99, true, true, '2025-09-01 02:14:26.739965+00', '2025-09-01 02:26:54.905186+00', NULL, 0, NULL, '#000000'),
	('d0649a20-607e-4352-bb84-50a1a67df869', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821323', 'Unisex t-shirt DARK / Autumn / M', 'Autumn-M', 'Autumn', 'M', 24.99, true, true, '2025-09-01 02:14:26.751941+00', '2025-09-01 02:26:54.907004+00', NULL, 0, NULL, '#000000'),
	('d17a3d05-b188-4b7e-8871-5555ac3fc68d', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821325', 'Unisex t-shirt DARK / Autumn / XL', 'Autumn-XL', 'Autumn', 'XL', 24.99, true, true, '2025-09-01 02:14:26.735874+00', '2025-09-01 02:26:54.909955+00', NULL, 0, NULL, '#000000'),
	('d944aabb-1734-4354-8fbc-3db099f8ea72', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821329', 'Unisex t-shirt DARK / Heather Deep Teal / L', 'Heather Deep Teal-L', 'Heather Deep Teal', 'L', 24.99, true, true, '2025-09-01 02:14:26.724929+00', '2025-09-01 02:26:54.914759+00', NULL, 0, NULL, '#000000'),
	('d97d4b29-5ef9-41cd-94a4-5b77efe5cfcf', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821330', 'Unisex t-shirt DARK / Heather Deep Teal / XL', 'Heather Deep Teal-XL', 'Heather Deep Teal', 'XL', 24.99, true, true, '2025-09-01 02:14:26.727201+00', '2025-09-01 02:26:54.915911+00', NULL, 0, NULL, '#000000'),
	('e4dbb55f-86b8-45c1-985f-a6a6de4737d3', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821334', 'Unisex t-shirt DARK / Mauve / L', 'Mauve-L', 'Mauve', 'L', 24.99, true, true, '2025-09-01 02:14:26.761627+00', '2025-09-01 02:26:54.92095+00', NULL, 0, NULL, '#000000'),
	('e9d03c25-a6a9-4f6c-86da-43e379e949ce', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821335', 'Unisex t-shirt DARK / Mauve / XL', 'Mauve-XL', 'Mauve', 'XL', 24.99, true, true, '2025-09-01 02:14:26.73394+00', '2025-09-01 02:26:54.922418+00', NULL, 0, NULL, '#000000'),
	('f6a6b3ed-c92d-429e-a95a-50c870b4565e', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821338', 'Unisex t-shirt DARK / Steel Blue / M', 'Steel Blue-M', 'Steel Blue', 'M', 24.99, true, true, '2025-09-01 02:14:26.760234+00', '2025-09-01 02:26:54.926752+00', NULL, 0, NULL, '#000000'),
	('f8397996-e917-40e0-a08a-f6bbc79ff567', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821339', 'Unisex t-shirt DARK / Steel Blue / L', 'Steel Blue-L', 'Steel Blue', 'L', 24.99, true, true, '2025-09-01 02:14:26.755618+00', '2025-09-01 02:26:54.927977+00', NULL, 0, NULL, '#000000'),
	('00452e16-ac13-4141-b067-e2efb11a2b27', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814128', 'Unisex t-shirt LIGHT / Mustard / S', 'Mustard-S', 'Mustard', 'S', 24.99, true, true, '2025-09-01 02:14:26.770439+00', '2025-09-01 02:26:56.72659+00', NULL, 0, NULL, '#000000'),
	('238f474e-2df8-4484-9dca-c663299ac0c9', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814132', 'Unisex t-shirt LIGHT / Mustard / 2XL', 'Mustard-2XL', 'Mustard', '2XL', 24.99, true, true, '2025-09-01 02:14:26.789402+00', '2025-09-01 02:26:56.74116+00', NULL, 0, NULL, '#000000'),
	('3346f8fd-86dc-441a-bb8f-a264d21b77b4', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814133', 'Unisex t-shirt LIGHT / Heather Prism Peach / S', 'Heather Prism Peach-S', 'Heather Prism Peach', 'S', 24.99, true, true, '2025-09-01 02:14:26.7668+00', '2025-09-01 02:26:56.74356+00', NULL, 0, NULL, '#000000'),
	('380bf6bd-ae31-4281-b755-4af08a567c3a', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814134', 'Unisex t-shirt LIGHT / Heather Prism Peach / M', 'Heather Prism Peach-M', 'Heather Prism Peach', 'M', 24.99, true, true, '2025-09-01 02:14:26.780524+00', '2025-09-01 02:26:56.745978+00', NULL, 0, NULL, '#000000'),
	('3d8b8d31-bf42-4228-a20f-02b75e704f74', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814135', 'Unisex t-shirt LIGHT / Heather Prism Peach / L', 'Heather Prism Peach-L', 'Heather Prism Peach', 'L', 24.99, true, true, '2025-09-01 02:14:26.765263+00', '2025-09-01 02:26:56.747788+00', NULL, 0, NULL, '#000000'),
	('4df62c3f-d811-4283-8c2c-d05ac6d4fc2d', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814138', 'Unisex t-shirt LIGHT / Pink / S', 'Pink-S', 'Pink', 'S', 24.99, true, true, '2025-09-01 02:14:26.779454+00', '2025-09-01 02:26:56.753271+00', NULL, 0, NULL, '#000000'),
	('57330f5f-3de6-4a7a-b8e9-08526183b2a0', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814139', 'Unisex t-shirt LIGHT / Pink / M', 'Pink-M', 'Pink', 'M', 24.99, true, true, '2025-09-01 02:14:26.790594+00', '2025-09-01 02:26:56.75476+00', NULL, 0, NULL, '#000000'),
	('5a575833-392f-4e07-becd-891aa864a959', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814140', 'Unisex t-shirt LIGHT / Pink / L', 'Pink-L', 'Pink', 'L', 24.99, true, true, '2025-09-01 02:14:26.769277+00', '2025-09-01 02:26:56.756127+00', NULL, 0, NULL, '#000000'),
	('5bd13604-e884-48f3-8074-19f0c3dead9f', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814141', 'Unisex t-shirt LIGHT / Pink / XL', 'Pink-XL', 'Pink', 'XL', 24.99, true, true, '2025-09-01 02:14:26.775897+00', '2025-09-01 02:26:56.75803+00', NULL, 0, NULL, '#000000'),
	('5d71530f-c467-4a57-b1d1-73c91173b5a2', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814142', 'Unisex t-shirt LIGHT / Pink / 2XL', 'Pink-2XL', 'Pink', '2XL', 24.99, true, true, '2025-09-01 02:14:26.774822+00', '2025-09-01 02:26:56.759791+00', NULL, 0, NULL, '#000000'),
	('68478ee9-3edd-4b64-80ed-803de70131c2', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814143', 'Unisex t-shirt LIGHT / Athletic Heather / S', 'Athletic Heather-S', 'Athletic Heather', 'S', 24.99, true, true, '2025-09-01 02:14:26.784437+00', '2025-09-01 02:26:56.761465+00', NULL, 0, NULL, '#000000'),
	('699e2f18-63fc-43ca-9e4d-739933f276e9', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814144', 'Unisex t-shirt LIGHT / Athletic Heather / M', 'Athletic Heather-M', 'Athletic Heather', 'M', 24.99, true, true, '2025-09-01 02:14:26.781501+00', '2025-09-01 02:26:56.763033+00', NULL, 0, NULL, '#000000'),
	('8374f00a-f813-45f6-9385-c11abe7a3627', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814146', 'Unisex t-shirt LIGHT / Athletic Heather / XL', 'Athletic Heather-XL', 'Athletic Heather', 'XL', 24.99, true, true, '2025-09-01 02:14:26.783409+00', '2025-09-01 02:26:56.766127+00', NULL, 0, NULL, '#000000'),
	('98c753b8-ce78-460f-8b87-530681afe400', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814149', 'Unisex t-shirt LIGHT / Yellow / M', 'Yellow-M', 'Yellow', 'M', 24.99, true, true, '2025-09-01 02:14:26.772284+00', '2025-09-01 02:26:56.771776+00', NULL, 0, NULL, '#000000'),
	('9b115eef-1696-40b6-b5a8-57fe16b2f8cf', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814152', 'Unisex t-shirt LIGHT / Yellow / 2XL', 'Yellow-2XL', 'Yellow', '2XL', 24.99, true, true, '2025-09-01 02:14:26.773683+00', '2025-09-01 02:26:56.778718+00', NULL, 0, NULL, '#000000'),
	('9e926942-fefb-4f58-84a8-50166ebfc0c7', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814153', 'Unisex t-shirt LIGHT / Heather Dust / S', 'Heather Dust-S', 'Heather Dust', 'S', 24.99, true, true, '2025-09-01 02:14:26.782424+00', '2025-09-01 02:26:56.780437+00', NULL, 0, NULL, '#000000'),
	('a2544060-7185-42fd-b718-8d2a95de4344', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814155', 'Unisex t-shirt LIGHT / Heather Dust / L', 'Heather Dust-L', 'Heather Dust', 'L', 24.99, true, true, '2025-09-01 02:14:26.786578+00', '2025-09-01 02:26:56.783763+00', NULL, 0, NULL, '#000000'),
	('a59c7fc5-d8c4-48b7-b60d-bd32ef2c2f50', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814157', 'Unisex t-shirt LIGHT / Heather Dust / 2XL', 'Heather Dust-2XL', 'Heather Dust', '2XL', 24.99, true, true, '2025-09-01 02:14:26.776891+00', '2025-09-01 02:26:56.786271+00', NULL, 0, NULL, '#000000'),
	('b0a03a85-5e51-4b3e-a572-890facfe941f', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814158', 'Unisex t-shirt LIGHT / Ash / S', 'Ash-S', 'Ash', 'S', 24.99, true, true, '2025-09-01 02:14:26.764132+00', '2025-09-01 02:26:56.787685+00', NULL, 0, NULL, '#000000'),
	('b1134584-a1ce-4907-8fba-e362fbdf4ce2', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814159', 'Unisex t-shirt LIGHT / Ash / M', 'Ash-M', 'Ash', 'M', 24.99, true, true, '2025-09-01 02:14:26.777986+00', '2025-09-01 02:26:56.788982+00', NULL, 0, NULL, '#000000'),
	('d0edfb6f-c482-47f9-a67f-16c92014aa8a', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814161', 'Unisex t-shirt LIGHT / Ash / XL', 'Ash-XL', 'Ash', 'XL', 24.99, true, true, '2025-09-01 02:14:26.788454+00', '2025-09-01 02:26:56.791593+00', NULL, 0, NULL, '#000000'),
	('fee99e16-d9c5-4c6c-8488-57efb02891af', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814167', 'Unisex t-shirt LIGHT / White / 2XL', 'White-2XL', 'White', '2XL', 24.99, true, true, '2025-09-01 02:14:26.787507+00', '2025-09-01 02:26:56.798286+00', NULL, 0, NULL, '#000000'),
	('653205f6-b215-465b-a066-79dea1ee0d05', '704d146b-5800-4c63-b10b-f24812ec76f9', '4938952082', 'Reform UK Sticker', 'Default', 'Default', NULL, 2.99, true, true, '2025-09-01 02:14:26.578455+00', '2025-09-01 02:26:49.055484+00', NULL, 0, NULL, '#000000'),
	('06bc5937-e19a-4f04-af13-6065d166d978', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821282', 'Unisex t-shirt DARK / Black Heather / S', 'Black Heather-S', 'Black Heather', 'S', 24.99, true, true, '2025-09-01 02:14:26.711585+00', '2025-09-01 02:26:54.819008+00', NULL, 0, NULL, '#000000'),
	('0fbd6d8c-db1c-4f34-a3c3-be1bbbfd94ef', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821285', 'Unisex t-shirt DARK / Black Heather / XL', 'Black Heather-XL', 'Black Heather', 'XL', 24.99, true, true, '2025-09-01 02:14:26.756846+00', '2025-09-01 02:26:54.83125+00', NULL, 0, NULL, '#000000'),
	('4b619e19-474a-4783-ae7d-be246a298b2c', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821294', 'Unisex t-shirt DARK / Navy / L', 'Navy-L', 'Navy', 'L', 24.99, true, true, '2025-09-01 02:14:26.706487+00', '2025-09-01 02:26:54.853493+00', NULL, 0, NULL, '#000000'),
	('7305dfb8-013a-478c-9015-11571cf2b7ae', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821306', 'Unisex t-shirt DARK / Dark Grey Heather / 2XL', 'Dark Grey Heather-2XL', 'Dark Grey Heather', '2XL', 24.99, true, true, '2025-09-01 02:14:26.679093+00', '2025-09-01 02:26:54.878212+00', NULL, 0, NULL, '#000000'),
	('afa8a6cc-12fb-41a3-8f17-1e59e22f28ec', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821316', 'Unisex t-shirt DARK / Army / 2XL', 'Army-2XL', 'Army', '2XL', 24.99, true, true, '2025-09-01 02:14:26.741449+00', '2025-09-01 02:26:54.892014+00', NULL, 0, NULL, '#000000'),
	('df8b9e53-d214-4add-aa79-c657252a6a50', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821332', 'Unisex t-shirt DARK / Mauve / S', 'Mauve-S', 'Mauve', 'S', 24.99, true, true, '2025-09-01 02:14:26.702497+00', '2025-09-01 02:26:54.918076+00', NULL, 0, NULL, '#000000'),
	('f841022c-ad25-4476-97f1-a1958acdb0cf', '5b572776-8f20-4214-9928-2c8fe1081ec9', '4938821340', 'Unisex t-shirt DARK / Steel Blue / XL', 'Steel Blue-XL', 'Steel Blue', 'XL', 24.99, true, true, '2025-09-01 02:14:26.73213+00', '2025-09-01 02:26:54.929283+00', NULL, 0, NULL, '#000000'),
	('0e7f5d3d-9f32-492b-83e3-2e29abe376fd', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814129', 'Unisex t-shirt LIGHT / Mustard / M', 'Mustard-M', 'Mustard', 'M', 24.99, true, true, '2025-09-01 02:14:26.7934+00', '2025-09-01 02:26:56.730611+00', NULL, 0, NULL, '#000000'),
	('1aa2c496-4094-4225-901a-994819c74b33', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814130', 'Unisex t-shirt LIGHT / Mustard / L', 'Mustard-L', 'Mustard', 'L', 24.99, true, true, '2025-09-01 02:14:26.806641+00', '2025-09-01 02:26:56.733722+00', NULL, 0, NULL, '#000000'),
	('20a7e758-c737-4085-8590-ae45d1632df8', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814131', 'Unisex t-shirt LIGHT / Mustard / XL', 'Mustard-XL', 'Mustard', 'XL', 24.99, true, true, '2025-09-01 02:14:26.804769+00', '2025-09-01 02:26:56.737981+00', NULL, 0, NULL, '#000000'),
	('40faaa37-9250-40c6-8a7a-2428d60ed3fd', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814136', 'Unisex t-shirt LIGHT / Heather Prism Peach / XL', 'Heather Prism Peach-XL', 'Heather Prism Peach', 'XL', 24.99, true, true, '2025-09-01 02:14:26.799905+00', '2025-09-01 02:26:56.749695+00', NULL, 0, NULL, '#000000'),
	('44a43cc5-bdfa-4680-9368-8befc52c00d4', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814137', 'Unisex t-shirt LIGHT / Heather Prism Peach / 2XL', 'Heather Prism Peach-2XL', 'Heather Prism Peach', '2XL', 24.99, true, true, '2025-09-01 02:14:26.785548+00', '2025-09-01 02:26:56.751572+00', NULL, 0, NULL, '#000000'),
	('6ee8edc1-d19c-422c-93f6-c7933f1c508b', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814145', 'Unisex t-shirt LIGHT / Athletic Heather / L', 'Athletic Heather-L', 'Athletic Heather', 'L', 24.99, true, true, '2025-09-01 02:14:26.795221+00', '2025-09-01 02:26:56.764714+00', NULL, 0, NULL, '#000000'),
	('839416ac-3218-4aa7-a11c-cb62a7effbe1', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814147', 'Unisex t-shirt LIGHT / Athletic Heather / 2XL', 'Athletic Heather-2XL', 'Athletic Heather', '2XL', 24.99, true, true, '2025-09-01 02:14:26.768028+00', '2025-09-01 02:26:56.767755+00', NULL, 0, NULL, '#000000'),
	('8c330e51-f395-4f5d-9a87-7ecf32493699', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814148', 'Unisex t-shirt LIGHT / Yellow / S', 'Yellow-S', 'Yellow', 'S', 24.99, true, true, '2025-09-01 02:14:26.79252+00', '2025-09-01 02:26:56.769499+00', NULL, 0, NULL, '#000000'),
	('9a98e17b-827f-4afa-8b97-c6b94221a3ce', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814150', 'Unisex t-shirt LIGHT / Yellow / L', 'Yellow-L', 'Yellow', 'L', 24.99, true, true, '2025-09-01 02:14:26.805777+00', '2025-09-01 02:26:56.774025+00', NULL, 0, NULL, '#000000'),
	('9ac0408d-79e1-4341-b375-2dfef30be12e', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814151', 'Unisex t-shirt LIGHT / Yellow / XL', 'Yellow-XL', 'Yellow', 'XL', 24.99, true, true, '2025-09-01 02:14:26.797815+00', '2025-09-01 02:26:56.776563+00', NULL, 0, NULL, '#000000'),
	('a02530f1-2cd2-4cad-a43e-e62cd3988c2a', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814154', 'Unisex t-shirt LIGHT / Heather Dust / M', 'Heather Dust-M', 'Heather Dust', 'M', 24.99, true, true, '2025-09-01 02:14:26.791581+00', '2025-09-01 02:26:56.78235+00', NULL, 0, NULL, '#000000'),
	('a4a53dd5-9fff-405d-8c3b-3251444833c4', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814156', 'Unisex t-shirt LIGHT / Heather Dust / XL', 'Heather Dust-XL', 'Heather Dust', 'XL', 24.99, true, true, '2025-09-01 02:14:26.800868+00', '2025-09-01 02:26:56.785097+00', NULL, 0, NULL, '#000000'),
	('b7eb2368-3bf0-482b-a899-8deb14766791', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814160', 'Unisex t-shirt LIGHT / Ash / L', 'Ash-L', 'Ash', 'L', 24.99, true, true, '2025-09-01 02:14:26.801794+00', '2025-09-01 02:26:56.790371+00', NULL, 0, NULL, '#000000'),
	('d68949e5-6b66-429c-989d-02bf721b445c', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814162', 'Unisex t-shirt LIGHT / Ash / 2XL', 'Ash-2XL', 'Ash', '2XL', 24.99, true, true, '2025-09-01 02:14:26.798898+00', '2025-09-01 02:26:56.792717+00', NULL, 0, NULL, '#000000'),
	('e4224600-1162-469a-9a00-7183b98b3dd3', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814163', 'Unisex t-shirt LIGHT / White / S', 'White-S', 'White', 'S', 24.99, true, true, '2025-09-01 02:14:26.807634+00', '2025-09-01 02:26:56.79392+00', NULL, 0, NULL, '#000000'),
	('eb9267f9-a575-46b2-91af-c7d51d678e03', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814164', 'Unisex t-shirt LIGHT / White / M', 'White-M', 'White', 'M', 24.99, true, true, '2025-09-01 02:14:26.802918+00', '2025-09-01 02:26:56.795073+00', NULL, 0, NULL, '#000000'),
	('f8db2cc4-abad-43dc-8f18-cbc1f32b1c55', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814165', 'Unisex t-shirt LIGHT / White / L', 'White-L', 'White', 'L', 24.99, true, true, '2025-09-01 02:14:26.794285+00', '2025-09-01 02:26:56.796164+00', NULL, 0, NULL, '#000000'),
	('fa5c4a73-29fd-4086-8147-c3b8be9ff118', 'aee9a9a7-ad89-46dc-9646-b37cfd57a99d', '4938814166', 'Unisex t-shirt LIGHT / White / XL', 'White-XL', 'White', 'XL', 24.99, true, true, '2025-09-01 02:14:26.796297+00', '2025-09-01 02:26:56.79725+00', NULL, 0, NULL, '#000000'),
	('2eb117ca-1bd3-4bf4-a870-f98fc3235cb4', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800537', 'Unisex Hoodie DARK / Black / 2XL', 'Black-2XL', 'Black', '2XL', 39.99, true, true, '2025-09-01 02:14:26.595962+00', '2025-09-01 02:26:58.512787+00', NULL, 0, NULL, '#000000'),
	('dbf9cb86-d4a9-4d07-8f30-c2b9ca08d0da', 'cefed082-bbf9-4e3f-ad41-98653e3e1d93', '4938800553', 'Unisex Hoodie DARK / Indigo Blue / S', 'Indigo Blue-S', 'Indigo Blue', 'S', 39.99, true, true, '2025-09-01 02:14:26.604866+00', '2025-09-01 02:26:58.542941+00', NULL, 0, NULL, '#000000'),
	('749e3c8f-842f-4bf9-80ef-b86e3385fec3', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797552', 'Unisex Hoodie LIGHT / Light Blue / L', 'Light Blue-L', 'Light Blue', 'L', 39.99, true, true, '2025-09-01 02:14:26.628834+00', '2025-09-01 02:26:59.662134+00', NULL, 0, NULL, '#000000'),
	('ab4738df-969f-4483-83a7-9c32fc587ee7', '51453873-4414-4fbe-8db0-cee194fb2553', '4938797557', 'Unisex Hoodie LIGHT / Light Pink / L', 'Light Pink-L', 'Light Pink', 'L', 39.99, true, true, '2025-09-01 02:14:26.646091+00', '2025-09-01 02:26:59.668625+00', NULL, 0, NULL, '#000000');


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
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
