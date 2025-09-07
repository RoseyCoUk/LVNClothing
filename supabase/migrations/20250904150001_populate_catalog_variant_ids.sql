-- Populate catalog_variant_id based on sync variant ID mappings
-- This migration creates a mapping function and populates existing data
-- Safe migration with complete rollback capability

-- Create a function to map sync variant IDs to catalog variant IDs
CREATE OR REPLACE FUNCTION public.get_catalog_variant_id(sync_variant_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Direct mapping table based on Printful API data
  -- Generated from sync-to-catalog-variant-mappings.json on 2025-09-04
  RETURN CASE 
    -- Sticker variants
    WHEN sync_variant_id = '4938952082' THEN 10163
    
    -- Mug variants  
    WHEN sync_variant_id = '4938946337' THEN 1320
    
    -- Mouse Pad variants
    WHEN sync_variant_id = '4938942751' THEN 13097
    
    -- Water Bottle variants
    WHEN sync_variant_id = '4938941055' THEN 20175
    
    -- Cap variants
    WHEN sync_variant_id = '4938937571' THEN 7854  -- Black
    WHEN sync_variant_id = '4938937572' THEN 7857  -- Dark Grey
    WHEN sync_variant_id = '4938937573' THEN 12736 -- Khaki
    WHEN sync_variant_id = '4938937574' THEN 7855  -- Light Blue
    WHEN sync_variant_id = '4938937575' THEN 7859  -- Navy
    WHEN sync_variant_id = '4938937576' THEN 7858  -- Pink
    WHEN sync_variant_id = '4938937577' THEN 7856  -- Stone
    WHEN sync_variant_id = '4938937578' THEN 7853  -- White
    
    -- T-Shirt DARK variants
    WHEN sync_variant_id = '4938821282' THEN 8923
    WHEN sync_variant_id = '4938821283' THEN 8924
    WHEN sync_variant_id = '4938821284' THEN 8925
    WHEN sync_variant_id = '4938821285' THEN 8926
    WHEN sync_variant_id = '4938821286' THEN 8927
    WHEN sync_variant_id = '4938821287' THEN 4016
    WHEN sync_variant_id = '4938821288' THEN 4017
    WHEN sync_variant_id = '4938821289' THEN 4018
    WHEN sync_variant_id = '4938821290' THEN 4019
    WHEN sync_variant_id = '4938821291' THEN 4020
    WHEN sync_variant_id = '4938821292' THEN 4111
    WHEN sync_variant_id = '4938821293' THEN 4112
    WHEN sync_variant_id = '4938821294' THEN 4113
    WHEN sync_variant_id = '4938821295' THEN 4114
    WHEN sync_variant_id = '4938821296' THEN 4115
    WHEN sync_variant_id = '4938821297' THEN 4141
    WHEN sync_variant_id = '4938821298' THEN 4142
    WHEN sync_variant_id = '4938821299' THEN 4143
    WHEN sync_variant_id = '4938821300' THEN 4144
    WHEN sync_variant_id = '4938821301' THEN 4145
    WHEN sync_variant_id = '4938821302' THEN 8460
    WHEN sync_variant_id = '4938821303' THEN 8461
    WHEN sync_variant_id = '4938821304' THEN 8462
    WHEN sync_variant_id = '4938821305' THEN 8463
    WHEN sync_variant_id = '4938821306' THEN 8464
    WHEN sync_variant_id = '4938821307' THEN 4031
    WHEN sync_variant_id = '4938821308' THEN 4032
    WHEN sync_variant_id = '4938821309' THEN 4033
    WHEN sync_variant_id = '4938821310' THEN 4034
    WHEN sync_variant_id = '4938821311' THEN 4035
    WHEN sync_variant_id = '4938821312' THEN 8440
    WHEN sync_variant_id = '4938821313' THEN 8441
    WHEN sync_variant_id = '4938821314' THEN 8442
    WHEN sync_variant_id = '4938821315' THEN 8443
    WHEN sync_variant_id = '4938821316' THEN 8444
    WHEN sync_variant_id = '4938821317' THEN 4121
    WHEN sync_variant_id = '4938821318' THEN 4122
    WHEN sync_variant_id = '4938821319' THEN 4123
    WHEN sync_variant_id = '4938821320' THEN 4124
    WHEN sync_variant_id = '4938821321' THEN 4125
    WHEN sync_variant_id = '4938821322' THEN 10384
    WHEN sync_variant_id = '4938821323' THEN 10385
    WHEN sync_variant_id = '4938821324' THEN 10386
    WHEN sync_variant_id = '4938821325' THEN 10387
    WHEN sync_variant_id = '4938821326' THEN 10388
    WHEN sync_variant_id = '4938821327' THEN 8481
    WHEN sync_variant_id = '4938821328' THEN 8482
    WHEN sync_variant_id = '4938821329' THEN 8483
    WHEN sync_variant_id = '4938821330' THEN 8484
    WHEN sync_variant_id = '4938821331' THEN 8485
    WHEN sync_variant_id = '4938821332' THEN 9395
    WHEN sync_variant_id = '4938821333' THEN 9396
    WHEN sync_variant_id = '4938821334' THEN 9397
    WHEN sync_variant_id = '4938821335' THEN 9398
    WHEN sync_variant_id = '4938821336' THEN 9399
    WHEN sync_variant_id = '4938821337' THEN 4161
    WHEN sync_variant_id = '4938821338' THEN 4162
    WHEN sync_variant_id = '4938821339' THEN 4163
    WHEN sync_variant_id = '4938821340' THEN 4164
    WHEN sync_variant_id = '4938821341' THEN 4165
    
    -- T-Shirt LIGHT variants
    WHEN sync_variant_id = '4938814128' THEN 10376
    WHEN sync_variant_id = '4938814129' THEN 10377
    WHEN sync_variant_id = '4938814130' THEN 10378
    WHEN sync_variant_id = '4938814131' THEN 10379
    WHEN sync_variant_id = '4938814132' THEN 10380
    WHEN sync_variant_id = '4938814133' THEN 9367
    WHEN sync_variant_id = '4938814134' THEN 9368
    WHEN sync_variant_id = '4938814135' THEN 9369
    WHEN sync_variant_id = '4938814136' THEN 9370
    WHEN sync_variant_id = '4938814137' THEN 9371
    WHEN sync_variant_id = '4938814138' THEN 4136
    WHEN sync_variant_id = '4938814139' THEN 4137
    WHEN sync_variant_id = '4938814140' THEN 4138
    WHEN sync_variant_id = '4938814141' THEN 4139
    WHEN sync_variant_id = '4938814142' THEN 4140
    WHEN sync_variant_id = '4938814143' THEN 6948
    WHEN sync_variant_id = '4938814144' THEN 6949
    WHEN sync_variant_id = '4938814145' THEN 6950
    WHEN sync_variant_id = '4938814146' THEN 6951
    WHEN sync_variant_id = '4938814147' THEN 6952
    WHEN sync_variant_id = '4938814148' THEN 4181
    WHEN sync_variant_id = '4938814149' THEN 4182
    WHEN sync_variant_id = '4938814150' THEN 4183
    WHEN sync_variant_id = '4938814151' THEN 4184
    WHEN sync_variant_id = '4938814152' THEN 4185
    WHEN sync_variant_id = '4938814153' THEN 10360
    WHEN sync_variant_id = '4938814154' THEN 10361
    WHEN sync_variant_id = '4938814155' THEN 10362
    WHEN sync_variant_id = '4938814156' THEN 10363
    WHEN sync_variant_id = '4938814157' THEN 10364
    WHEN sync_variant_id = '4938814158' THEN 4026
    WHEN sync_variant_id = '4938814159' THEN 4027
    WHEN sync_variant_id = '4938814160' THEN 4028
    WHEN sync_variant_id = '4938814161' THEN 4029
    WHEN sync_variant_id = '4938814162' THEN 4030
    WHEN sync_variant_id = '4938814163' THEN 4011
    WHEN sync_variant_id = '4938814164' THEN 4012
    WHEN sync_variant_id = '4938814165' THEN 4013
    WHEN sync_variant_id = '4938814166' THEN 4014
    WHEN sync_variant_id = '4938814167' THEN 4015
    
    -- Hoodie DARK variants  
    WHEN sync_variant_id = '4938800533' THEN 5530
    WHEN sync_variant_id = '4938800534' THEN 5531
    WHEN sync_variant_id = '4938800535' THEN 5532
    WHEN sync_variant_id = '4938800536' THEN 5533
    WHEN sync_variant_id = '4938800537' THEN 5534
    WHEN sync_variant_id = '4938800538' THEN 5594
    WHEN sync_variant_id = '4938800539' THEN 5595
    WHEN sync_variant_id = '4938800540' THEN 5596
    WHEN sync_variant_id = '4938800541' THEN 5597
    WHEN sync_variant_id = '4938800542' THEN 5598
    WHEN sync_variant_id = '4938800543' THEN 5538
    WHEN sync_variant_id = '4938800544' THEN 5539
    WHEN sync_variant_id = '4938800545' THEN 5540
    WHEN sync_variant_id = '4938800546' THEN 5541
    WHEN sync_variant_id = '4938800547' THEN 5542
    WHEN sync_variant_id = '4938800548' THEN 10806
    WHEN sync_variant_id = '4938800549' THEN 10807
    WHEN sync_variant_id = '4938800550' THEN 10808
    WHEN sync_variant_id = '4938800551' THEN 10809
    WHEN sync_variant_id = '4938800552' THEN 10810
    WHEN sync_variant_id = '4938800553' THEN 5562
    WHEN sync_variant_id = '4938800554' THEN 5563
    WHEN sync_variant_id = '4938800555' THEN 5564
    WHEN sync_variant_id = '4938800556' THEN 5565
    WHEN sync_variant_id = '4938800557' THEN 5566
    
    -- Hoodie LIGHT variants
    WHEN sync_variant_id = '4938797545' THEN 5610
    WHEN sync_variant_id = '4938797546' THEN 5611
    WHEN sync_variant_id = '4938797547' THEN 5612
    WHEN sync_variant_id = '4938797548' THEN 5613
    WHEN sync_variant_id = '4938797549' THEN 5614
    WHEN sync_variant_id = '4938797550' THEN 10841
    WHEN sync_variant_id = '4938797551' THEN 10842
    WHEN sync_variant_id = '4938797552' THEN 10843
    WHEN sync_variant_id = '4938797553' THEN 10844
    WHEN sync_variant_id = '4938797554' THEN 10845
    WHEN sync_variant_id = '4938797555' THEN 10849
    WHEN sync_variant_id = '4938797556' THEN 10850
    WHEN sync_variant_id = '4938797557' THEN 10851
    WHEN sync_variant_id = '4938797558' THEN 10852
    WHEN sync_variant_id = '4938797559' THEN 10853
    WHEN sync_variant_id = '4938797560' THEN 5522
    WHEN sync_variant_id = '4938797561' THEN 5523
    WHEN sync_variant_id = '4938797562' THEN 5524
    WHEN sync_variant_id = '4938797563' THEN 5525
    WHEN sync_variant_id = '4938797564' THEN 5526
    
    -- Tote Bag variants
    WHEN sync_variant_id = '4937855201' THEN 10457
    
    -- Return NULL for unknown sync variant IDs
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing product_variants with catalog_variant_id
UPDATE public.product_variants 
SET catalog_variant_id = public.get_catalog_variant_id(printful_variant_id)
WHERE printful_variant_id IS NOT NULL;

-- Create a trigger to automatically populate catalog_variant_id for new records
CREATE OR REPLACE FUNCTION public.auto_populate_catalog_variant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If printful_variant_id is provided and catalog_variant_id is not set
  IF NEW.printful_variant_id IS NOT NULL AND NEW.catalog_variant_id IS NULL THEN
    NEW.catalog_variant_id = public.get_catalog_variant_id(NEW.printful_variant_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for automatic population
DROP TRIGGER IF EXISTS trigger_auto_populate_catalog_variant_id ON public.product_variants;
CREATE TRIGGER trigger_auto_populate_catalog_variant_id
    BEFORE INSERT OR UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_populate_catalog_variant_id();

-- Log the completion with stats
DO $$ 
DECLARE
  updated_count INTEGER;
  total_count INTEGER;
BEGIN 
  SELECT COUNT(*) INTO total_count FROM public.product_variants;
  SELECT COUNT(*) INTO updated_count FROM public.product_variants WHERE catalog_variant_id IS NOT NULL;
  
  RAISE NOTICE '✅ Created catalog variant ID mapping function with 158 variant mappings';
  RAISE NOTICE '📊 Updated % of % existing product variants with catalog IDs', updated_count, total_count;
  RAISE NOTICE '🔄 Auto-population trigger created for new records';
END $$;