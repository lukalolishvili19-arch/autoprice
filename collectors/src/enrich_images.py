"""Backfill missing product images from public product pages."""
from __future__ import annotations

import psycopg

from .base import DATABASE_URL
from .products import _detail_images


def enrich_missing_images(limit: int = 120) -> dict:
    updated = 0
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT p.id, o.product_url
                   FROM products p
                   JOIN offers o ON o.product_id = p.id
                   JOIN stores s ON s.id = o.store_id
                   WHERE s.slug = 'amboli'
                     AND o.product_url LIKE '%%/products/%%'
                     AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
                   ORDER BY p.id
                   LIMIT %s""",
                (limit,),
            )
            rows = cur.fetchall()
            for product_id, url in rows:
                imgs = _detail_images(url)
                if not imgs:
                    continue
                for i, img in enumerate(imgs):
                    cur.execute(
                        """INSERT INTO product_images (product_id, url, is_primary, sort_order)
                           SELECT %s,%s,%s,%s WHERE NOT EXISTS (
                             SELECT 1 FROM product_images WHERE product_id=%s AND url=%s)""",
                        (product_id, img, i == 0, i, product_id, img),
                    )
                updated += 1
            conn.commit()
    return {"updated": updated, "checked": len(rows)}
