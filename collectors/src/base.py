"""Inspect-first collectors. Never invent APIs. Never bypass Cloudflare/CAPTCHA/auth."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import requests
from bs4 import BeautifulSoup

UA = "AutoPriceGeorgia/1.0 (price comparison; +https://localhost; polite collector)"
TIMEOUT = 25


@dataclass
class FuelObservation:
    company_slug: str
    fuel_type: str
    price: float
    source_url: str
    observed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    station_name: str | None = None
    city: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None


@dataclass
class ProductObservation:
    store_slug: str
    name: str
    source_url: str
    price: float | None = None
    old_price: float | None = None
    currency: str = "GEL"
    available: bool = True
    brand: str | None = None
    category: str | None = None
    sku: str | None = None
    ean: str | None = None
    part_number: str | None = None
    viscosity: str | None = None
    volume: str | None = None
    description: str | None = None
    image_urls: list[str] = field(default_factory=list)
    external_id: str | None = None
    last_checked: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class CollectError(Exception):
    pass


def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept-Language": "ka,en;q=0.8"})
    return s


def fetch_html(url: str) -> tuple[str, BeautifulSoup]:
    r = session().get(url, timeout=TIMEOUT)
    if r.status_code in (401, 403, 429):
        raise CollectError(f"blocked {r.status_code} {url} — not bypassing access control")
    r.raise_for_status()
    text = r.text
    if "you have been blocked" in text.lower() or "cf-ray" in text.lower() and "cloudflare" in text.lower():
        raise CollectError(f"Cloudflare challenge at {url} — not bypassing")
    return text, BeautifulSoup(text, "lxml")


def fetch_json(url: str) -> tuple[Any, Any]:
    r = session().get(url, timeout=TIMEOUT)
    if r.status_code in (401, 403, 429):
        raise CollectError(f"blocked {r.status_code} {url} — not bypassing access control")
    r.raise_for_status()
    return r.json(), r.headers


def parse_gel(text: str | None) -> float | None:
    if not text:
        return None
    m = re.search(r"(\d+[.,]\d+|\d+)", text.replace("\xa0", " "))
    if not m:
        return None
    return float(m.group(1).replace(",", "."))


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://autoprice:autoprice@localhost:5432/autoprice",
)
