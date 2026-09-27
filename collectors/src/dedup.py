"""Merge collector-created duplicate products into existing master records."""
from __future__ import annotations

from .base import DATABASE_URL
from .matching import match
from .products import _guess

GENERIC_URL_SUFFIXES = ("/en/", "/en", "/ka/", "/ka")


def _is_generic_url(url: str | None) -> bool:
    if not url:
        return True
    u = url.rstrip("/")
    return u.endswith("amboli.ge/en") or u.endswith("amboli.ge/ka") or u.endswith("amboli.ge")


def _load_candidates(cur) -> list[dict]:
    cur.execute(
        """SELECT p.id, p.name, p.sku, p.ean, p.part_number, p.viscosity, p.volume, b.name AS brand
           FROM products p LEFT JOIN brands b ON b.id = p.brand_id
           WHERE p.slug NOT LIKE '%-amboli'"""
    )
    return [
        {
            "id": r[0],
            "name": r[1],
            "sku": r[2],
            "ean": r[3],
            "part_number": r[4],
            "viscosity": r[5],
            "volume": r[6],
            "brand": r[7],
        }
        for r in cur.fetchall()
    ]


def _merge_offer(cur, master_id: int, dup_id: int) -> None:
    cur.execute("SELECT id, store_id, price, old_price, available, product_url, external_id, last_checked FROM offers WHERE product_id=%s", (dup_id,))
    for offer_id, store_id, price, old_price, available, product_url, external_id, last_checked in cur.fetchall():
        cur.execute("SELECT id FROM offers WHERE product_id=%s AND store_id=%s", (master_id, store_id))
        existing = cur.fetchone()
        if existing:
            cur.execute(
                """UPDATE offers SET price=%s, old_price=%s, available=%s, product_url=%s,
                   external_id=%s, last_checked=%s WHERE id=%s""",
                (price, old_price, available, product_url, external_id, last_checked, existing[0]),
            )
            cur.execute("UPDATE price_history SET offer_id=%s, product_id=%s WHERE offer_id=%s", (existing[0], master_id, offer_id))
            cur.execute("DELETE FROM offers WHERE id=%s", (offer_id,))
        else:
            cur.execute("UPDATE offers SET product_id=%s WHERE id=%s", (master_id, offer_id))
            cur.execute("UPDATE price_history SET product_id=%s WHERE offer_id=%s", (master_id, offer_id))


def _merge_images(cur, master_id: int, dup_id: int) -> None:
    cur.execute(
        """INSERT INTO product_images (product_id, url, is_primary, sort_order)
           SELECT %s, url, FALSE, sort_order + 100
           FROM product_images pi
           WHERE product_id=%s AND NOT EXISTS (
             SELECT 1 FROM product_images WHERE product_id=%s AND url = pi.url)""",
        (master_id, dup_id, master_id),
    )


def _merge_mappings(cur, master_id: int, dup_id: int) -> None:
    cur.execute(
        """UPDATE product_source_mapping SET product_id=%s
           WHERE product_id IS NULL AND store_id IN (SELECT store_id FROM offers WHERE product_id=%s)""",
        (master_id, dup_id),
    )


def dedupe_products() -> dict:
    merged = 0
    skipped = 0
    url_merged = 0
    with __import__("psycopg").connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT store_id, product_url, MIN(product_id) AS keep_id, array_agg(DISTINCT product_id) AS ids
                   FROM offers
                   WHERE product_url IS NOT NULL
                   GROUP BY store_id, product_url
                   HAVING COUNT(DISTINCT product_id) > 1"""
            )
            for store_id, product_url, keep_id, dup_ids in cur.fetchall():
                if _is_generic_url(product_url):
                    continue
                for dup_id in dup_ids:
                    if dup_id == keep_id:
                        continue
                    _merge_offer(cur, keep_id, dup_id)
                    _merge_images(cur, keep_id, dup_id)
                    _merge_mappings(cur, keep_id, dup_id)
                    cur.execute("DELETE FROM product_source_mapping WHERE product_id=%s", (dup_id,))
                    cur.execute("DELETE FROM product_images WHERE product_id=%s", (dup_id,))
                    cur.execute("DELETE FROM products WHERE id=%s", (dup_id,))
                    url_merged += 1

            cur.execute(
                """SELECT store_id, source_url, MIN(product_id) AS keep_id, array_agg(DISTINCT product_id) AS ids
                   FROM product_source_mapping
                   WHERE product_id IS NOT NULL AND source_url IS NOT NULL
                   GROUP BY store_id, source_url
                   HAVING COUNT(DISTINCT product_id) > 1"""
            )
            for store_id, source_url, keep_id, dup_ids in cur.fetchall():
                if _is_generic_url(source_url):
                    continue
                for dup_id in dup_ids:
                    if dup_id == keep_id:
                        continue
                    _merge_offer(cur, keep_id, dup_id)
                    _merge_images(cur, keep_id, dup_id)
                    _merge_mappings(cur, keep_id, dup_id)
                    cur.execute("DELETE FROM product_source_mapping WHERE product_id=%s", (dup_id,))
                    cur.execute("DELETE FROM product_images WHERE product_id=%s", (dup_id,))
                    cur.execute("DELETE FROM products WHERE id=%s", (dup_id,))
                    url_merged += 1

            candidates = _load_candidates(cur)
            cur.execute(
                """SELECT p.id, p.name, p.sku, p.ean, p.part_number, p.viscosity, p.volume, b.name AS brand
                   FROM products p LEFT JOIN brands b ON b.id = p.brand_id
                   WHERE p.slug LIKE '%-amboli' ORDER BY p.id"""
            )
            dups = cur.fetchall()
            for dup_id, name, sku, ean, part_number, viscosity, volume, brand in dups:
                guessed_brand, guessed_vis, guessed_vol = _guess(name)
                brand = brand or guessed_brand
                viscosity = viscosity or guessed_vis
                volume = volume or guessed_vol
                result = match(
                    ean=ean,
                    sku=sku,
                    brand=brand,
                    name=name,
                    viscosity=viscosity,
                    volume=volume,
                    candidates=candidates,
                )
                if not result.auto_merge or not result.product_id or result.product_id == dup_id:
                    skipped += 1
                    continue
                master_id = result.product_id
                _merge_offer(cur, master_id, dup_id)
                _merge_images(cur, master_id, dup_id)
                _merge_mappings(cur, master_id, dup_id)
                cur.execute("DELETE FROM product_source_mapping WHERE product_id=%s", (dup_id,))
                cur.execute("DELETE FROM product_images WHERE product_id=%s", (dup_id,))
                cur.execute("DELETE FROM products WHERE id=%s", (dup_id,))
                merged += 1
            conn.commit()
    return {"merged": merged, "skipped": skipped, "urlMerged": url_merged}
