CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE stores (
    id              BIGSERIAL PRIMARY KEY,
    slug            VARCHAR(64) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    type            VARCHAR(32) NOT NULL DEFAULT 'AUTO',
    website_url     VARCHAR(512),
    logo_url        VARCHAR(1024),
    description     TEXT,
    city            VARCHAR(128),
    last_checked    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
    id          BIGSERIAL PRIMARY KEY,
    slug        VARCHAR(128) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    logo_url    VARCHAR(1024)
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    slug        VARCHAR(128) NOT NULL UNIQUE,
    name_ka     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255) NOT NULL,
    icon        VARCHAR(32),
    bg_class    VARCHAR(64),
    border_class VARCHAR(64),
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(512) NOT NULL,
    name_normalized VARCHAR(512) NOT NULL,
    brand_id        BIGINT REFERENCES brands(id),
    category_id     BIGINT REFERENCES categories(id),
    subcategory     VARCHAR(255),
    description     TEXT,
    sku             VARCHAR(128),
    ean             VARCHAR(64),
    part_number     VARCHAR(128),
    viscosity       VARCHAR(64),
    volume          VARCHAR(64),
    unit            VARCHAR(32),
    compatibility   TEXT,
    currency        VARCHAR(8) NOT NULL DEFAULT 'GEL',
    popularity      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_norm_trgm ON products USING gin (name_normalized gin_trgm_ops);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_ean ON products (ean);
CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_viscosity ON products (viscosity);
CREATE INDEX idx_products_volume ON products (volume);

CREATE TABLE product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         VARCHAR(2048) NOT NULL,
    alt_text    VARCHAR(512),
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

CREATE TABLE product_attributes (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attr_key    VARCHAR(128) NOT NULL,
    attr_value  VARCHAR(512) NOT NULL
);

CREATE TABLE offers (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id        BIGINT NOT NULL REFERENCES stores(id),
    price           NUMERIC(12,2),
    old_price       NUMERIC(12,2),
    currency        VARCHAR(8) NOT NULL DEFAULT 'GEL',
    available       BOOLEAN NOT NULL DEFAULT FALSE,
    product_url     VARCHAR(2048),
    external_id     VARCHAR(255),
    last_checked    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, store_id)
);

CREATE INDEX idx_offers_product ON offers (product_id);
CREATE INDEX idx_offers_store ON offers (store_id);
CREATE INDEX idx_offers_price ON offers (price);

CREATE TABLE price_history (
    id          BIGSERIAL PRIMARY KEY,
    offer_id    BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id    BIGINT NOT NULL REFERENCES stores(id),
    price       NUMERIC(12,2) NOT NULL,
    available   BOOLEAN NOT NULL DEFAULT TRUE,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history (product_id, observed_at);

CREATE TABLE product_source_mapping (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT REFERENCES products(id) ON DELETE SET NULL,
    store_id        BIGINT NOT NULL REFERENCES stores(id),
    external_id     VARCHAR(255),
    source_name     VARCHAR(512) NOT NULL,
    source_url      VARCHAR(2048),
    ean             VARCHAR(64),
    sku             VARCHAR(128),
    match_method    VARCHAR(64),
    confidence      NUMERIC(5,4) NOT NULL DEFAULT 0,
    auto_merged     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psm_store_ext ON product_source_mapping (store_id, external_id);

CREATE TABLE fuel_companies (
    id              BIGSERIAL PRIMARY KEY,
    slug            VARCHAR(64) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    logo_url        VARCHAR(1024),
    website_url     VARCHAR(512),
    color_dot       VARCHAR(64) NOT NULL,
    chart_color     VARCHAR(16) NOT NULL,
    station_count   INT,
    last_checked    TIMESTAMPTZ
);

CREATE TABLE fuel_stations (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES fuel_companies(id),
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(128),
    address         VARCHAR(512),
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    last_checked    TIMESTAMPTZ
);

CREATE INDEX idx_fuel_stations_company ON fuel_stations (company_id);
CREATE INDEX idx_fuel_stations_city ON fuel_stations (city);

CREATE TABLE fuel_prices (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES fuel_companies(id),
    station_id      BIGINT REFERENCES fuel_stations(id),
    fuel_type       VARCHAR(32) NOT NULL,
    price           NUMERIC(8,3) NOT NULL,
    currency        VARCHAR(8) NOT NULL DEFAULT 'GEL',
    source_url      VARCHAR(512),
    last_checked    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, station_id, fuel_type)
);

CREATE INDEX idx_fuel_prices_type ON fuel_prices (fuel_type);

CREATE TABLE fuel_price_history (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES fuel_companies(id),
    station_id      BIGINT REFERENCES fuel_stations(id),
    fuel_type       VARCHAR(32) NOT NULL,
    price           NUMERIC(8,3) NOT NULL,
    observed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_url      VARCHAR(512)
);

CREATE INDEX idx_fph_company_type ON fuel_price_history (company_id, fuel_type, observed_at);

CREATE TABLE favorites (
    id          BIGSERIAL PRIMARY KEY,
    client_key  VARCHAR(128) NOT NULL,
    item_type   VARCHAR(32) NOT NULL,
    item_id     BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_key, item_type, item_id)
);

CREATE TABLE price_alerts (
    id              BIGSERIAL PRIMARY KEY,
    client_key      VARCHAR(128) NOT NULL,
    alert_type      VARCHAR(32) NOT NULL,
    product_id      BIGINT REFERENCES products(id) ON DELETE CASCADE,
    fuel_type       VARCHAR(32),
    company_id      BIGINT REFERENCES fuel_companies(id),
    city            VARCHAR(128),
    target_price    NUMERIC(12,3) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scrape_runs (
    id              BIGSERIAL PRIMARY KEY,
    collector       VARCHAR(64) NOT NULL,
    status          VARCHAR(32) NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    items_ok        INT NOT NULL DEFAULT 0,
    items_failed    INT NOT NULL DEFAULT 0,
    message         TEXT
);

CREATE TABLE scrape_errors (
    id              BIGSERIAL PRIMARY KEY,
    run_id          BIGINT REFERENCES scrape_runs(id) ON DELETE CASCADE,
    collector       VARCHAR(64) NOT NULL,
    source_url      VARCHAR(1024),
    error_message   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE,
    display_name    VARCHAR(255),
    password_hash   VARCHAR(255),
    role            VARCHAR(32) NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
