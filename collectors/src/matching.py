"""Master-product matching. Low confidence is never auto-merged."""
from __future__ import annotations

import re
from dataclasses import dataclass

from rapidfuzz import fuzz

AUTO_MIN = 0.86


@dataclass
class MatchResult:
    method: str
    confidence: float
    product_id: int | None
    auto_merge: bool


def normalize_name(name: str) -> str:
    s = name.lower()
    s = re.sub(r"\([^)]*\)", " ", s)
    s = s.replace("mobil1", "mobil 1")
    s = re.sub(r"(\d)w-?(\d)", r"\1w-\2", s)
    s = re.sub(r"(\d)\s*l\b", r"\1l", s)
    s = re.sub(r"\b(\d+)\s*(engine oil|tyre|tire)\b", r"\1l", s)
    s = re.sub(r"[^a-z0-9ა-ჰ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def match(
    *,
    ean: str | None,
    sku: str | None,
    brand: str | None,
    name: str,
    viscosity: str | None,
    volume: str | None,
    candidates: list[dict],
) -> MatchResult:
    if ean:
        for c in candidates:
            if c.get("ean") and c["ean"] == ean:
                return MatchResult("ean", 1.0, c["id"], True)
    if sku:
        for c in candidates:
            if c.get("sku") and c["sku"].lower() == sku.lower():
                return MatchResult("sku", 0.98, c["id"], True)
            if c.get("part_number") and c["part_number"].lower() == sku.lower():
                return MatchResult("part_number", 0.97, c["id"], True)

    norm = normalize_name(name)
    brand_n = (brand or "").lower().strip()
    vol_n = (volume or "").lower().replace(" ", "")
    vis_n = (viscosity or "").lower().replace(" ", "")

    for c in candidates:
        cbrand = (c.get("brand") or "").lower()
        cname = normalize_name(c.get("name") or "")
        cvol = (c.get("volume") or "").lower().replace(" ", "")
        if brand_n and cbrand == brand_n and norm == cname and vol_n and cvol == vol_n:
            return MatchResult("brand_name_volume", 0.94, c["id"], True)

    for c in candidates:
        cbrand = (c.get("brand") or "").lower()
        cname = normalize_name(c.get("name") or "")
        cvol = (c.get("volume") or "").lower().replace(" ", "")
        cvis = (c.get("viscosity") or "").lower().replace(" ", "")
        if brand_n and cbrand == brand_n and vis_n and cvis == vis_n and vol_n and cvol == vol_n:
            score = fuzz.token_sort_ratio(norm, cname) / 100.0
            if score >= 0.82:
                return MatchResult("brand_visc_vol_fuzzy", round(score, 4), c["id"], True)

    best: MatchResult | None = None
    for c in candidates:
        score = fuzz.token_sort_ratio(norm, normalize_name(c.get("name") or "")) / 100.0
        if best is None or score > best.confidence:
            best = MatchResult("fuzzy", round(score, 4), c["id"], False)
    if best and best.confidence >= AUTO_MIN:
        # still never auto-merge fuzzy
        return MatchResult("fuzzy", best.confidence, best.product_id, False)
    return MatchResult("none", best.confidence if best else 0.0, None, False)
