-- Restore seed master products accidentally collapsed by generic Amboli placeholder URL dedup.
CREATE OR REPLACE FUNCTION seed_master_product(
    p_slug TEXT,
    p_name TEXT,
    p_brand TEXT,
    p_category TEXT,
    p_viscosity TEXT,
    p_volume TEXT,
    p_unit TEXT,
    p_sku TEXT,
    available_store TEXT,
    p_price NUMERIC,
    p_old NUMERIC,
    p_url TEXT
) RETURNS VOID AS $$
DECLARE
    pid BIGINT;
    bid BIGINT;
    cid BIGINT;
    s RECORD;
    norm TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM products WHERE slug = p_slug) THEN
        RETURN;
    END IF;
    norm := lower(regexp_replace(p_name, '[^a-zA-Z0-9ა-ჰ]+', ' ', 'g'));
    SELECT id INTO bid FROM brands WHERE slug = p_brand;
    SELECT id INTO cid FROM categories WHERE slug = p_category;
    INSERT INTO products (slug, name, name_normalized, brand_id, category_id, viscosity, volume, unit, sku, popularity)
    VALUES (p_slug, p_name, trim(norm), bid, cid, p_viscosity, p_volume, p_unit, p_sku, 10)
    RETURNING id INTO pid;

    FOR s IN SELECT id, slug FROM stores WHERE type = 'AUTO' LOOP
        INSERT INTO offers (product_id, store_id, price, old_price, available, product_url, last_checked)
        VALUES (
            pid,
            s.id,
            CASE WHEN s.slug = available_store THEN p_price ELSE NULL END,
            CASE WHEN s.slug = available_store THEN p_old ELSE NULL END,
            s.slug = available_store,
            CASE WHEN s.slug = available_store THEN p_url ELSE NULL END,
            NOW()
        )
        ON CONFLICT (product_id, store_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT seed_master_product('totachi-eurodrive-eco-5w30-1l', 'Totachi EURODRIVE ECO 5W-30 1L', 'totachi', 'engine-oils', '5W-30', '1L', 'L', NULL, 'amboli', 24.7, 40, 'https://amboli.ge/en/');
SELECT seed_master_product('wolf-vitaltech-5w30-sp-4l', 'Wolf VitalTech 5W-30 SP 4L', 'wolf', 'engine-oils', '5W-30', '4L', 'L', NULL, 'amboli', 74.4, 124, 'https://amboli.ge/en/');
SELECT seed_master_product('wolf-vitaltech-5w30-sp-1l', 'Wolf VitalTech 5W-30 SP 1L', 'wolf', 'engine-oils', '5W-30', '1L', 'L', NULL, 'amboli', 19.8, 33, 'https://amboli.ge/en/');
SELECT seed_master_product('wolf-vitaltech-5w40-4l', 'Wolf VitalTech 5W-40 4L', 'wolf', 'engine-oils', '5W-40', '4L', 'L', NULL, 'amboli', 74.4, 124, 'https://amboli.ge/en/');
SELECT seed_master_product('oem-honda-5w30-4l', 'OEM Honda 5W-30 SP/GF-6 4L', 'oem', 'engine-oils', '5W-30', '4L', 'L', NULL, 'amboli', 166.4, 208, 'https://amboli.ge/en/');
SELECT seed_master_product('oem-mitsubishi-5w30-4l', 'OEM Mitsubishi 5W-30 SN-Z 4L', 'oem', 'engine-oils', '5W-30', '4L', 'L', NULL, 'amboli', 118.4, 148, 'https://amboli.ge/en/');
SELECT seed_master_product('oem-toyota-cvt-tc-4l', 'OEM Toyota CVT TC 4L', 'oem', 'gearbox-oils', NULL, '4L', 'L', NULL, 'amboli', 166.4, 208, 'https://amboli.ge/en/');
SELECT seed_master_product('fanfaro-vsx-5w40-1l', 'FANFARO VSX 5W-40 1L', 'fanfaro', 'engine-oils', '5W-40', '1L', 'L', NULL, 'amboli', 18, 27, 'https://amboli.ge/en/');
SELECT seed_master_product('goodyear-eagle-sport-2-225-50r17', 'Goodyear Eagle Sport 2 225/50R17 Summer', 'goodyear', 'tires', NULL, '225/50R17', NULL, NULL, 'amboli', 239, 470, 'https://amboli.ge/en/');
SELECT seed_master_product('goodyear-eagle-sport-2-215-45r17', 'Goodyear Eagle Sport 2 215/45R17 Summer', 'goodyear', 'tires', NULL, '215/45R17', NULL, NULL, 'amboli', 229, 430, 'https://amboli.ge/en/');

DROP FUNCTION seed_master_product;
