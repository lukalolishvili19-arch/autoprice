-- Re-restore seed masters after generic-URL dedup removed them (dedup now skips placeholder URLs).
INSERT INTO products (slug, name, name_normalized, brand_id, category_id, viscosity, volume, unit, sku, popularity)
SELECT v.slug, v.name, trim(lower(regexp_replace(v.name, '[^a-zA-Z0-9ა-ჰ]+', ' ', 'g'))), b.id, c.id, v.viscosity, v.volume, v.unit, v.sku, 10
FROM (VALUES
  ('totachi-eurodrive-eco-5w30-1l', 'Totachi EURODRIVE ECO 5W-30 1L', 'totachi', 'engine-oils', '5W-30', '1L', 'L', NULL::text),
  ('wolf-vitaltech-5w30-sp-4l', 'Wolf VitalTech 5W-30 SP 4L', 'wolf', 'engine-oils', '5W-30', '4L', 'L', NULL::text),
  ('wolf-vitaltech-5w30-sp-1l', 'Wolf VitalTech 5W-30 SP 1L', 'wolf', 'engine-oils', '5W-30', '1L', 'L', NULL::text),
  ('wolf-vitaltech-5w40-4l', 'Wolf VitalTech 5W-40 4L', 'wolf', 'engine-oils', '5W-40', '4L', 'L', NULL::text),
  ('oem-honda-5w30-4l', 'OEM Honda 5W-30 SP/GF-6 4L', 'oem', 'engine-oils', '5W-30', '4L', 'L', NULL::text),
  ('oem-mitsubishi-5w30-4l', 'OEM Mitsubishi 5W-30 SN-Z 4L', 'oem', 'engine-oils', '5W-30', '4L', 'L', NULL::text),
  ('oem-toyota-cvt-tc-4l', 'OEM Toyota CVT TC 4L', 'oem', 'gearbox-oils', NULL, '4L', 'L', NULL::text),
  ('fanfaro-vsx-5w40-1l', 'FANFARO VSX 5W-40 1L', 'fanfaro', 'engine-oils', '5W-40', '1L', 'L', NULL::text),
  ('goodyear-eagle-sport-2-225-50r17', 'Goodyear Eagle Sport 2 225/50R17 Summer', 'goodyear', 'tires', NULL, '225/50R17', NULL, NULL::text),
  ('goodyear-eagle-sport-2-215-45r17', 'Goodyear Eagle Sport 2 215/45R17 Summer', 'goodyear', 'tires', NULL, '215/45R17', NULL, NULL::text)
) AS v(slug, name, brand, category, viscosity, volume, unit, sku)
JOIN brands b ON b.slug = v.brand
JOIN categories c ON c.slug = v.category
ON CONFLICT (slug) DO NOTHING;

INSERT INTO offers (product_id, store_id, price, old_price, available, product_url, last_checked)
SELECT p.id, s.id,
       CASE WHEN s.slug = 'amboli' THEN v.price ELSE NULL END,
       CASE WHEN s.slug = 'amboli' THEN v.old_price ELSE NULL END,
       s.slug = 'amboli',
       CASE WHEN s.slug = 'amboli' THEN 'https://amboli.ge/en/' ELSE NULL END,
       NOW()
FROM (VALUES
  ('totachi-eurodrive-eco-5w30-1l', 24.7, 40),
  ('wolf-vitaltech-5w30-sp-4l', 74.4, 124),
  ('wolf-vitaltech-5w30-sp-1l', 19.8, 33),
  ('wolf-vitaltech-5w40-4l', 74.4, 124),
  ('oem-honda-5w30-4l', 166.4, 208),
  ('oem-mitsubishi-5w30-4l', 118.4, 148),
  ('oem-toyota-cvt-tc-4l', 166.4, 208),
  ('fanfaro-vsx-5w40-1l', 18, 27),
  ('goodyear-eagle-sport-2-225-50r17', 239, 470),
  ('goodyear-eagle-sport-2-215-45r17', 229, 430)
) AS v(slug, price, old_price)
JOIN products p ON p.slug = v.slug
CROSS JOIN stores s
WHERE s.type = 'AUTO'
ON CONFLICT (product_id, store_id) DO NOTHING;
