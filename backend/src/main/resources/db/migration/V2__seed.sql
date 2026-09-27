INSERT INTO stores (slug, name, name_en, type, website_url, logo_url) VALUES
('tegeta', 'Tegeta Motors', 'Tegeta Motors', 'AUTO', 'https://shop.tegetamotors.ge/ge/home', 'https://shop.tegetamotors.ge/favicon.ico'),
('amboli', 'Amboli', 'Amboli', 'AUTO', 'https://amboli.ge/en/', 'https://amboli.ge/favicon.ico'),
('vika-dpa', 'Vika DPA', 'Vika DPA', 'AUTO', 'https://vikadpa.ge/shop/', 'https://vikadpa.ge/favicon.ico'),
('valvoline', 'Valvoline Georgia', 'Valvoline Georgia', 'AUTO', 'https://valvoline.ge/', 'https://valvoline.ge/favicon.ico'),
('shell-house', 'Shell House Georgia', 'Shell House Georgia', 'AUTO', 'https://shellhousegeorgia.com/', 'https://shellhousegeorgia.com/favicon.ico'),
('akumulatori', 'Akumulatori.ge', 'Akumulatori.ge', 'AUTO', 'https://akumulatori.ge/', 'https://akumulatori.ge/favicon.ico');

INSERT INTO brands (slug, name) VALUES
('mobil-1', 'Mobil 1'),
('shell', 'Shell'),
('castrol', 'Castrol'),
('bosch', 'Bosch'),
('mann-filter', 'Mann Filter'),
('varta', 'Varta'),
('valvoline', 'Valvoline');

INSERT INTO categories (slug, name_ka, name_en, icon, bg_class, border_class, sort_order) VALUES
('engine-oils', 'ძრავის ზეთები', 'Engine Oils', '🛢️', 'bg-amber-50', 'border-amber-100', 1),
('gearbox-oils', 'გადაცემათა ზეთები', 'Gearbox Oils', '⚙️', 'bg-blue-50', 'border-blue-100', 2),
('batteries', 'აკუმულატორები', 'Batteries', '🔋', 'bg-green-50', 'border-green-100', 3),
('filters', 'ფილტრები', 'Filters', '🔩', 'bg-slate-50', 'border-slate-200', 4),
('brakes', 'სამუხრუჭე სისტემა', 'Brakes', '⚡', 'bg-red-50', 'border-red-100', 5),
('antifreeze', 'ანტიფრიზი', 'Antifreeze', '❄️', 'bg-cyan-50', 'border-cyan-100', 6),
('chemistry', 'ავტოქიმია', 'Auto Chemistry', '🧪', 'bg-purple-50', 'border-purple-100', 7),
('spark-plugs', 'სანთლები', 'Spark Plugs', '✨', 'bg-yellow-50', 'border-yellow-100', 8),
('lights', 'ნათურები', 'Lights', '💡', 'bg-orange-50', 'border-orange-100', 9),
('tires', 'საბურავები', 'Tires', '🏎️', 'bg-slate-100', 'border-slate-200', 10),
('parts', 'ავტონაწილები', 'Auto Parts', '🔧', 'bg-teal-50', 'border-teal-100', 11),
('accessories', 'ავტო აქსესუარები', 'Accessories', '🎯', 'bg-pink-50', 'border-pink-100', 12);

INSERT INTO fuel_companies (slug, name, website_url, color_dot, chart_color, station_count, last_checked) VALUES
('wissol', 'Wissol', 'https://wissol.ge/ka/fuel-prices', 'bg-red-500', '#ef4444', NULL, NOW()),
('socar', 'SOCAR', 'https://sgp.ge/price-archive', 'bg-blue-600', '#3b82f6', NULL, NOW()),
('gulf', 'Gulf', 'https://gulf.ge/ge/fuel_prices', 'bg-amber-500', '#f59e0b', NULL, NOW()),
('rompetrol', 'Rompetrol', 'https://www.rompetrol.ge/', 'bg-cyan-500', '#06b6d4', NULL, NOW()),
('portal', 'Portal', 'https://portal.com.ge/ka/fuel-prices', 'bg-slate-600', '#64748b', NULL, NOW()),
('lukoil', 'Lukoil', 'https://www.lukoil.ge/prices-history', 'bg-red-700', '#b91c1c', NULL, NOW());

-- Current network prices from public pages inspected 2026-08-30. station_id NULL = company-level.
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.71, 'https://wissol.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'wissol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.85, 'https://wissol.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'wissol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 4.26, 'https://wissol.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'wissol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.42, 'https://wissol.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'wissol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'lpg', 1.64, 'https://wissol.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'wissol';

INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.63, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.80, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 4.24, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.20, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'lpg', 1.75, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'cng', 1.60, 'https://sgp.ge/price-archive', NOW() FROM fuel_companies WHERE slug = 'socar';

INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.69, 'https://gulf.ge/ge/fuel_prices', NOW() FROM fuel_companies WHERE slug = 'gulf';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.87, 'https://gulf.ge/ge/fuel_prices', NOW() FROM fuel_companies WHERE slug = 'gulf';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 4.29, 'https://gulf.ge/ge/fuel_prices', NOW() FROM fuel_companies WHERE slug = 'gulf';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.37, 'https://gulf.ge/ge/fuel_prices', NOW() FROM fuel_companies WHERE slug = 'gulf';

INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.68, 'https://www.rompetrol.ge/', NOW() FROM fuel_companies WHERE slug = 'rompetrol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.88, 'https://www.rompetrol.ge/', NOW() FROM fuel_companies WHERE slug = 'rompetrol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 4.30, 'https://www.rompetrol.ge/', NOW() FROM fuel_companies WHERE slug = 'rompetrol';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.39, 'https://www.rompetrol.ge/', NOW() FROM fuel_companies WHERE slug = 'rompetrol';

INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.63, 'https://portal.com.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'portal';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.79, 'https://portal.com.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'portal';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 3.99, 'https://portal.com.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'portal';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.34, 'https://portal.com.ge/ka/fuel-prices', NOW() FROM fuel_companies WHERE slug = 'portal';

INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'regular', 3.70, 'https://www.lukoil.ge/prices-history', NOW() FROM fuel_companies WHERE slug = 'lukoil';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'premium', 3.86, 'https://www.lukoil.ge/prices-history', NOW() FROM fuel_companies WHERE slug = 'lukoil';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'super', 4.27, 'https://www.lukoil.ge/prices-history', NOW() FROM fuel_companies WHERE slug = 'lukoil';
INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
SELECT id, 'diesel', 4.45, 'https://www.lukoil.ge/prices-history', NOW() FROM fuel_companies WHERE slug = 'lukoil';

-- Append-only history: copy current snapshot
INSERT INTO fuel_price_history (company_id, fuel_type, price, observed_at, source_url)
SELECT company_id, fuel_type, price, last_checked, source_url FROM fuel_prices;

-- Gulf published dated table (regular = Euro Regular GER)
INSERT INTO fuel_price_history (company_id, fuel_type, price, observed_at, source_url)
SELECT c.id, 'regular', v.price, v.ts, 'https://gulf.ge/ge/fuel_prices'
FROM fuel_companies c
CROSS JOIN (VALUES
    (3.69::numeric, TIMESTAMPTZ '2026-08-25'),
    (3.65, TIMESTAMPTZ '2026-08-21'),
    (3.65, TIMESTAMPTZ '2026-08-11'),
    (3.59, TIMESTAMPTZ '2026-08-03'),
    (3.59, TIMESTAMPTZ '2026-07-31'),
    (3.59, TIMESTAMPTZ '2026-07-23'),
    (3.55, TIMESTAMPTZ '2026-07-04')
) AS v(price, ts)
WHERE c.slug = 'gulf';

INSERT INTO fuel_price_history (company_id, fuel_type, price, observed_at, source_url)
SELECT c.id, 'regular', v.price, v.ts, 'https://sgp.ge/price-archive'
FROM fuel_companies c
CROSS JOIN (VALUES
    (3.63::numeric, TIMESTAMPTZ '2026-08-30'),
    (3.63, TIMESTAMPTZ '2026-08-18'),
    (3.63, TIMESTAMPTZ '2026-08-11')
) AS v(price, ts)
WHERE c.slug = 'socar';

INSERT INTO fuel_price_history (company_id, fuel_type, price, observed_at, source_url)
SELECT c.id, 'regular', v.price, v.ts, 'https://www.lukoil.ge/prices-history'
FROM fuel_companies c
CROSS JOIN (VALUES
    (3.70::numeric, TIMESTAMPTZ '2026-08-27 09:34:04+04'),
    (3.66, TIMESTAMPTZ '2026-08-20 07:35:29+04'),
    (3.60, TIMESTAMPTZ '2026-08-06 08:39:35+04'),
    (3.55, TIMESTAMPTZ '2026-07-20 10:00:11+04')
) AS v(price, ts)
WHERE c.slug = 'lukoil';
