from __future__ import annotations

from datetime import datetime, timezone

import psycopg

from .base import DATABASE_URL, FuelObservation, ProductObservation
from .dedup import dedupe_products
from .enrich_images import enrich_missing_images
from .matching import MatchResult, match, normalize_name


def _slug(s: str) -> str:
    return normalize_name(s).replace(" ", "-")[:180]


def save_fuel(obs: list[FuelObservation], errors: list[str]) -> dict:
    now = datetime.now(timezone.utc)
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO scrape_runs (collector, status, started_at) VALUES ('fuel','RUNNING',%s) RETURNING id",
                (now,),
            )
            run_id = cur.fetchone()[0]
            ok = 0
            failed = 0
            for e in errors:
                failed += 1
                cur.execute(
                    "INSERT INTO scrape_errors (run_id, collector, error_message) VALUES (%s,'fuel',%s)",
                    (run_id, e),
                )
            for o in obs:
                cur.execute("SELECT id FROM fuel_companies WHERE slug=%s", (o.company_slug,))
                row = cur.fetchone()
                if not row:
                    continue
                cid = row[0]
                cur.execute(
                    """UPDATE fuel_prices SET price=%s, source_url=%s, last_checked=%s
                       WHERE company_id=%s AND fuel_type=%s AND station_id IS NULL""",
                    (o.price, o.source_url, o.observed_at, cid, o.fuel_type),
                )
                if cur.rowcount == 0:
                    cur.execute(
                        """INSERT INTO fuel_prices (company_id, fuel_type, price, source_url, last_checked)
                           VALUES (%s,%s,%s,%s,%s)""",
                        (cid, o.fuel_type, o.price, o.source_url, o.observed_at),
                    )
                cur.execute(
                    """INSERT INTO fuel_price_history (company_id, fuel_type, price, observed_at, source_url)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (cid, o.fuel_type, o.price, o.observed_at, o.source_url),
                )
                cur.execute("UPDATE fuel_companies SET last_checked=%s WHERE id=%s", (o.observed_at, cid))
                ok += 1
            status = "OK" if ok else "FAILED"
            cur.execute(
                "UPDATE scrape_runs SET status=%s, finished_at=%s, items_ok=%s, items_failed=%s WHERE id=%s",
                (status, datetime.now(timezone.utc), ok, failed, run_id),
            )
            conn.commit()
            return {"runId": run_id, "ok": ok, "failed": failed, "status": status}


def save_products(obs: list[ProductObservation], errors: list[str]) -> dict:
    now = datetime.now(timezone.utc)
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO scrape_runs (collector, status, started_at) VALUES ('products','RUNNING',%s) RETURNING id",
                (now,),
            )
            run_id = cur.fetchone()[0]
            failed = 0
            for e in errors:
                failed += 1
                cur.execute(
                    "INSERT INTO scrape_errors (run_id, collector, error_message) VALUES (%s,'products',%s)",
                    (run_id, e),
                )
            cur.execute(
                """SELECT p.id, p.name, p.sku, p.ean, p.part_number, p.viscosity, p.volume, b.name AS brand
                   FROM products p LEFT JOIN brands b ON b.id = p.brand_id"""
            )
            candidates = [
                {"id": r[0], "name": r[1], "sku": r[2], "ean": r[3], "part_number": r[4],
                 "viscosity": r[5], "volume": r[6], "brand": r[7]}
                for r in cur.fetchall()
            ]
            ok = 0
            for o in obs:
                cur.execute("SELECT id FROM stores WHERE slug=%s", (o.store_slug,))
                store = cur.fetchone()
                if not store:
                    continue
                store_id = store[0]
                cur.execute(
                    """SELECT product_id FROM product_source_mapping
                       WHERE store_id=%s AND source_url=%s AND product_id IS NOT NULL
                       ORDER BY id DESC LIMIT 1""",
                    (store_id, o.source_url),
                )
                mapped = cur.fetchone()
                if mapped:
                    product_id = mapped[0]
                    result = MatchResult("source_url", 1.0, product_id, True)
                else:
                    result = match(
                        ean=o.ean, sku=o.sku, brand=o.brand, name=o.name,
                        viscosity=o.viscosity, volume=o.volume, candidates=candidates,
                    )
                    product_id = result.product_id if result.auto_merge else None
                if product_id is None:
                    slug = _slug(o.name) + f"-{o.store_slug}"
                    cur.execute("SELECT id FROM products WHERE slug=%s", (slug,))
                    existing = cur.fetchone()
                    if existing:
                        product_id = existing[0]
                    else:
                        brand_id = None
                        if o.brand:
                            bslug = _slug(o.brand)
                            cur.execute(
                                "INSERT INTO brands (slug, name) VALUES (%s,%s) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id",
                                (bslug, o.brand),
                            )
                            brand_id = cur.fetchone()[0]
                        cat_id = None
                        if o.category:
                            cur.execute("SELECT id FROM categories WHERE slug=%s", (o.category,))
                            c = cur.fetchone()
                            cat_id = c[0] if c else None
                        cur.execute(
                            """INSERT INTO products (slug, name, name_normalized, brand_id, category_id, sku, ean,
                               viscosity, volume, description, updated_at)
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW()) RETURNING id""",
                            (slug, o.name, normalize_name(o.name), brand_id, cat_id, o.sku, o.ean,
                             o.viscosity, o.volume, o.description),
                        )
                        product_id = cur.fetchone()[0]
                        candidates.append({
                            "id": product_id, "name": o.name, "sku": o.sku, "ean": o.ean,
                            "part_number": o.part_number, "viscosity": o.viscosity, "volume": o.volume, "brand": o.brand,
                        })
                    if not result.auto_merge:
                        product_id_map = product_id if result.confidence == 0 else None
                    else:
                        product_id_map = product_id
                else:
                    product_id_map = product_id

                pid = product_id if result.auto_merge else product_id
                cur.execute(
                    """INSERT INTO offers (product_id, store_id, price, old_price, available, product_url, external_id, last_checked)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT (product_id, store_id) DO UPDATE SET
                         price=EXCLUDED.price, old_price=EXCLUDED.old_price, available=EXCLUDED.available,
                         product_url=EXCLUDED.product_url, last_checked=EXCLUDED.last_checked""",
                    (pid, store_id, o.price, o.old_price, o.available, o.source_url, o.external_id, o.last_checked),
                )
                cur.execute("SELECT id FROM offers WHERE product_id=%s AND store_id=%s", (pid, store_id))
                offer_id = cur.fetchone()[0]
                if o.price is not None:
                    cur.execute(
                        """INSERT INTO price_history (offer_id, product_id, store_id, price, available, observed_at)
                           VALUES (%s,%s,%s,%s,%s,%s)""",
                        (offer_id, pid, store_id, o.price, o.available, o.last_checked),
                    )
                for i, img in enumerate(o.image_urls):
                    cur.execute(
                        """INSERT INTO product_images (product_id, url, is_primary, sort_order)
                           SELECT %s,%s,%s,%s WHERE NOT EXISTS (
                             SELECT 1 FROM product_images WHERE product_id=%s AND url=%s)""",
                        (pid, img, i == 0, i, pid, img),
                    )
                cur.execute(
                    """INSERT INTO product_source_mapping
                       (product_id, store_id, external_id, source_name, source_url, ean, sku, match_method, confidence, auto_merged)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (pid, store_id, o.external_id, o.name, o.source_url,
                     o.ean, o.sku, result.method, result.confidence, result.auto_merge),
                )
                cur.execute("UPDATE stores SET last_checked=%s WHERE id=%s", (o.last_checked, store_id))
                ok += 1
            status = "OK" if ok else "FAILED"
            cur.execute(
                "UPDATE scrape_runs SET status=%s, finished_at=%s, items_ok=%s, items_failed=%s WHERE id=%s",
                (status, datetime.now(timezone.utc), ok, failed, run_id),
            )
            conn.commit()
            dedupe = dedupe_products()
            images = enrich_missing_images()
            return {"runId": run_id, "ok": ok, "failed": failed, "status": status, "dedupe": dedupe, "images": images}


def save_stations(rows: list[dict], errors: list[str]) -> dict:
    now = datetime.now(timezone.utc)
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO scrape_runs (collector, status, started_at) VALUES ('stations','RUNNING',%s) RETURNING id",
                (now,),
            )
            run_id = cur.fetchone()[0]
            ok = 0
            failed = len(errors)
            for e in errors:
                cur.execute(
                    "INSERT INTO scrape_errors (run_id, collector, error_message) VALUES (%s,'stations',%s)",
                    (run_id, e),
                )
            for row in rows:
                cur.execute("SELECT id FROM fuel_companies WHERE slug=%s", (row["company_slug"],))
                company = cur.fetchone()
                if not company:
                    continue
                cid = company[0]
                cur.execute(
                    """SELECT id FROM fuel_stations
                       WHERE company_id=%s AND name=%s AND coalesce(address,'')=coalesce(%s,'')""",
                    (cid, row["name"], row.get("address")),
                )
                existing = cur.fetchone()
                if existing:
                    cur.execute(
                        """UPDATE fuel_stations
                           SET city=%s, address=%s, latitude=%s, longitude=%s, last_checked=%s
                           WHERE id=%s""",
                        (row.get("city"), row.get("address"), row.get("latitude"), row.get("longitude"), now, existing[0]),
                    )
                else:
                    cur.execute(
                        """INSERT INTO fuel_stations (company_id, name, city, address, latitude, longitude, last_checked)
                           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                        (cid, row["name"], row.get("city"), row.get("address"), row.get("latitude"), row.get("longitude"), now),
                    )
                cur.execute("UPDATE fuel_companies SET last_checked=%s WHERE id=%s", (now, cid))
                ok += 1
            status = "OK" if ok else "FAILED"
            cur.execute(
                "UPDATE scrape_runs SET status=%s, finished_at=%s, items_ok=%s, items_failed=%s WHERE id=%s",
                (status, datetime.now(timezone.utc), ok, failed, run_id),
            )
            conn.commit()
            return {"runId": run_id, "ok": ok, "failed": failed, "status": status}
