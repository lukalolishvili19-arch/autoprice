"""Fuel station collectors — coordinates only when present in public HTML."""
from __future__ import annotations

import re

from .base import CollectError, fetch_html, session


def collect_lukoil_stations() -> list[dict]:
    url = "https://www.lukoil.ge/stations"
    _, soup = fetch_html(url)
    lines = [ln.strip() for ln in soup.get_text("\n", strip=True).split("\n") if ln.strip()]
    rows: list[dict] = []
    i = 0
    while i < len(lines):
        if lines[i].isdigit() and i + 3 < len(lines):
            num, city, address, _typ = lines[i], lines[i + 1], lines[i + 2], lines[i + 3]
            rows.append({
                "company_slug": "lukoil",
                "name": f"Lukoil #{num}",
                "city": city,
                "address": address,
                "latitude": None,
                "longitude": None,
                "source_url": url,
            })
            i += 4
        else:
            i += 1
    if not rows:
        raise CollectError("lukoil: no station rows parsed")
    return rows


def collect_portal_stations() -> list[dict]:
    """Portal embeds branch coordinates in public RSC payload."""
    url = "https://portal.com.ge/ka/stations"
    text = session().get(url, timeout=25).text
    rows: list[dict] = []
    seen: set[str] = set()
    patterns_full = [
        re.compile(
            r'"name":"([^"]+)","address":"([^"]*)","latitude":([0-9.]+),"longitude":([0-9.]+)'
        ),
        re.compile(
            r'\\"name\\":\\"([^\\"]+)\\",\\"address\\":\\"([^\\"]*)\\",\\"latitude\\":([0-9.]+),\\"longitude\\":([0-9.]+)'
        ),
    ]
    pattern_coords = re.compile(r'"latitude":([0-9.]+),"longitude":([0-9.]+)')
    for pattern in patterns_full:
        for m in pattern.finditer(text):
            name, address, lat, lng = m.group(1), m.group(2), float(m.group(3)), float(m.group(4))
            if not (41.0 <= lat <= 43.5 and 39.5 <= lng <= 46.5):
                continue
            key = f"{lat},{lng},{name}"
            if key in seen:
                continue
            seen.add(key)
            city = address.split(",")[0].strip() if address else None
            rows.append({
                "company_slug": "portal",
                "name": name,
                "city": city,
                "address": address or None,
                "latitude": lat,
                "longitude": lng,
                "source_url": url,
            })
        if rows:
            break
    if not rows:
        for m in pattern_coords.finditer(text):
            lat, lng = float(m.group(1)), float(m.group(2))
            if not (41.0 <= lat <= 43.5 and 39.5 <= lng <= 46.5):
                continue
            key = f"{lat},{lng}"
            if key in seen:
                continue
            seen.add(key)
            rows.append({
                "company_slug": "portal",
                "name": "Portal station",
                "city": None,
                "address": None,
                "latitude": lat,
                "longitude": lng,
                "source_url": url,
            })
    if not rows:
        raise CollectError("portal: no station coordinates in public HTML")
    return rows


STATION_COLLECTORS = {
    "lukoil": collect_lukoil_stations,
    "portal": collect_portal_stations,
}
