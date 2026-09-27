"""Fuel collectors — only parse publicly visible HTML. Inspected 2026-08-30."""
from __future__ import annotations

import re
from datetime import datetime, timezone

from .base import CollectError, FuelObservation, fetch_html, parse_gel


def collect_wissol() -> list[FuelObservation]:
    url = "https://wissol.ge/ka/fuel-prices"
    _, soup = fetch_html(url)
    text = soup.get_text("\n", strip=True)
    mapping = [
        ("ევრო რეგულარი", "regular"),
        ("ეკო პრემიუმი", "premium"),
        ("ეკო სუპერი", "super"),
        ("ევრო დიზელი", "diesel"),
        ("ვისოლ გაზი", "lpg"),
    ]
    out: list[FuelObservation] = []
    for label, ftype in mapping:
        # first number after the product name
        m = re.search(re.escape(label) + r".{0,80}?(\d+[.,]\d{2})", text, re.I | re.S)
        if m:
            out.append(FuelObservation("wissol", ftype, float(m.group(1).replace(",", ".")), url))
    if not out:
        raise CollectError("wissol: no prices parsed from public HTML")
    return out


def collect_gulf() -> list[FuelObservation]:
    url = "https://gulf.ge/ge/fuel_prices"
    _, soup = fetch_html(url)
    table = soup.find("table")
    if table is None:
        raise CollectError("gulf: no public table")
    rows = table.find_all("tr")
    if len(rows) < 2:
        raise CollectError("gulf: empty table")
    # first data row is latest: Date, Super, Premium, Euro Regular GER, ER, Diesel GED, ED
    cells = [c.get_text(strip=True) for c in rows[1].find_all(["td", "th"])]
    if len(cells) < 6:
        raise CollectError("gulf: unexpected columns")
    date = cells[0]
    try:
        observed = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        observed = datetime.now(timezone.utc)
    return [
        FuelObservation("gulf", "super", float(cells[1]), url, observed),
        FuelObservation("gulf", "premium", float(cells[2]), url, observed),
        FuelObservation("gulf", "regular", float(cells[3]), url, observed),
        FuelObservation("gulf", "diesel", float(cells[5]), url, observed),
    ]


def collect_socar() -> list[FuelObservation]:
    url = "https://sgp.ge/price-archive"
    _, soup = fetch_html(url)
    table = soup.find("table")
    if table is None:
        raise CollectError("socar: no public table")
    rows = table.find_all("tr")
    if len(rows) < 2:
        raise CollectError("socar: empty table")
    cells = [c.get_text(strip=True) for c in rows[1].find_all(["td", "th"])]
    # Date, Nano Super, Nano Premium, Nano Euro Regular, Euro5 Diesel, Nano Diesel, LPG, CNG
    if len(cells) < 8:
        raise CollectError("socar: unexpected columns")
    date = cells[0]
    try:
        observed = datetime.strptime(date, "%d/%m/%Y").replace(tzinfo=timezone.utc)
    except ValueError:
        observed = datetime.now(timezone.utc)

    def _price(idx: int, ftype: str) -> FuelObservation | None:
        raw = cells[idx].strip().replace(",", ".")
        if not raw:
            return None
        return FuelObservation("socar", ftype, float(raw), url, observed)

    out = [
        o
        for o in [
            _price(1, "super"),
            _price(2, "premium"),
            _price(3, "regular"),
            _price(4, "diesel"),
            _price(6, "lpg"),
            _price(7, "cng"),
        ]
        if o is not None
    ]
    if not out:
        raise CollectError("socar: no prices in latest row")
    return out


def collect_rompetrol() -> list[FuelObservation]:
    url = "https://www.rompetrol.ge/"
    _, soup = fetch_html(url)
    text = soup.get_text("\n", strip=True)
    mapping = [
        (r"efix\s*ევრო\s*რეგულარი", "regular"),
        (r"efix\s*ევრო\s*პრემიუმი", "premium"),
        (r"efix\s*სუპერი", "super"),
        (r"(?<!efix )ევრო\s*დიზელი", "diesel"),
    ]
    out = []
    for pat, ftype in mapping:
        m = re.search(pat + r".{0,60}?(\d+[.,]\d{2})", text, re.I | re.S)
        if m:
            out.append(FuelObservation("rompetrol", ftype, float(m.group(1).replace(",", ".")), url))
    if not out:
        raise CollectError("rompetrol: no prices on public homepage")
    return out


def collect_portal() -> list[FuelObservation]:
    url = "https://portal.com.ge/ka/fuel-prices"
    _, soup = fetch_html(url)
    text = soup.get_text("\n", strip=True)
    mapping = [
        ("EURO REGULAR", "regular"),
        ("PREMIUM", "premium"),
        ("SUPER", "super"),
        ("EURO DIESEL", "diesel"),
    ]
    out = []
    for label, ftype in mapping:
        m = re.search(label + r".{0,40}?(\d+[.,]\d{2})", text, re.I | re.S)
        if m:
            out.append(FuelObservation("portal", ftype, float(m.group(1).replace(",", ".")), url))
    if not out:
        raise CollectError("portal: no prices parsed")
    return out


def collect_lukoil() -> list[FuelObservation]:
    url = "https://www.lukoil.ge/prices-history"
    _, soup = fetch_html(url)
    table = soup.find("table")
    if table is None:
        raise CollectError("lukoil: no public history table")
    rows = table.find_all("tr")
    if len(rows) < 2:
        raise CollectError("lukoil: empty table")
    last = rows[-1]
    cells = [c.get_text(strip=True) for c in last.find_all(["td", "th"])]
    # # SuperEcto100 SuperEcto Premium EuroRegular EuroDiesel date
    if len(cells) < 6:
        raise CollectError("lukoil: unexpected columns")
    date = cells[-1]
    try:
        observed = datetime.strptime(date[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        observed = datetime.now(timezone.utc)
    return [
        FuelObservation("lukoil", "super", float(cells[2]), url, observed),
        FuelObservation("lukoil", "premium", float(cells[3]), url, observed),
        FuelObservation("lukoil", "regular", float(cells[4]), url, observed),
        FuelObservation("lukoil", "diesel", float(cells[5]), url, observed),
    ]


COLLECTORS = {
    "wissol": collect_wissol,
    "gulf": collect_gulf,
    "socar": collect_socar,
    "rompetrol": collect_rompetrol,
    "portal": collect_portal,
    "lukoil": collect_lukoil,
}


def collect_all_fuel() -> list[FuelObservation]:
    all_obs: list[FuelObservation] = []
    errors: list[str] = []
    for name, fn in COLLECTORS.items():
        try:
            all_obs.extend(fn())
        except Exception as e:
            errors.append(f"{name}: {e}")
    return all_obs
