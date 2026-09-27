"""Product collectors. Tegeta is Cloudflare-protected — recorded as scrape error, never bypassed."""
from __future__ import annotations

import html
import json
import re

from .base import CollectError, ProductObservation, fetch_html, fetch_json, parse_gel


VISC = re.compile(r"(\d+W-?\d+)", re.I)
VOL = re.compile(r"(\d+(?:[.,]\d+)?)\s*[lლL]\b")
VOL_PAREN = re.compile(r"\b(\d+(?:[.,]\d+)?)\s*\(\s*(?:ENGINE|TYRE|TIRE)", re.I)
TIRE_SIZE = re.compile(r"(\d{3}/\d{2}R\d{2})", re.I)
PRODUCT_PATH = re.compile(r"/products/[^/]+/[^/]+/?$")

AMBOLI_CATEGORIES = [
    "https://amboli.ge/en/products/engine-oil/",
    "https://amboli.ge/en/products/tires/",
    "https://amboli.ge/en/products/batteries/",
    "https://amboli.ge/en/products/antifreeze/",
    "https://amboli.ge/en/products/transmission-oil/",
    "https://amboli.ge/en/products/filter/",
    "https://amboli.ge/en/products/brake-system/",
    "https://amboli.ge/en/products/car-chemistry/",
    "https://amboli.ge/en/products/bulbs/",
]
PAGE_LINK = re.compile(r"page=(\d+)")
DETAIL_IMG = re.compile(r"/upload/Products/[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", re.I)


def _abs(url: str) -> str:
    if url.startswith("http"):
        return url
    return "https://amboli.ge" + url


def _norm_viscosity(raw: str) -> str:
    m = re.match(r"(\d+)W-?(\d+)", raw, re.I)
    if m:
        return f"{m.group(1)}W-{m.group(2)}"
    return raw.upper()


def _norm_volume(name: str) -> str | None:
    vol = VOL.search(name)
    if vol:
        return vol.group(1).replace(",", ".") + "L"
    paren = VOL_PAREN.search(name)
    if paren:
        return paren.group(1).replace(",", ".") + "L"
    tire = TIRE_SIZE.search(name)
    if tire:
        return tire.group(1).upper()
    return None


def _guess(name: str) -> tuple[str | None, str | None, str | None]:
    vis = VISC.search(name)
    brand = name.split(" ")[0] if name else None
    return (
        brand,
        _norm_viscosity(vis.group(1)) if vis else None,
        _norm_volume(name),
    )


def _guess_category(href: str, name: str) -> str | None:
    upper = name.upper()
    if "engine-oil" in href or "OIL" in upper or "5W" in upper:
        return "engine-oils"
    if "tires" in href or "TYRE" in upper or "TIRE" in upper:
        return "tires"
    if "batteries" in href or "BATTERY" in upper:
        return "batteries"
    if "antifreeze" in href:
        return "antifreeze"
    if "transmission" in href:
        return "gearbox-oils"
    if "filter" in href:
        return "filters"
    if "brake" in href:
        return "brakes"
    if "spark" in href:
        return "spark-plugs"
    if "chemistry" in href or "chem" in upper:
        return "car-chemistry"
    if "bulb" in href or "BULB" in upper:
        return "bulbs"
    if "auto-parts" in href or "parts" in href:
        return "auto-parts"
    if "accessories" in href:
        return "accessories"
    return None


def _product_image(anchor) -> str | None:
    for img in anchor.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if "/upload/Products/" in src:
            return _abs(src.split("?")[0])
    parent = anchor.find_parent(["div", "article", "li"])
    if parent:
        for img in parent.find_all("img"):
            src = img.get("src") or img.get("data-src") or ""
            if "/upload/Products/" in src:
                return _abs(src.split("?")[0])
    return None


def _card_text(anchor) -> str:
    parent = anchor.find_parent(["div", "article", "li"]) or anchor
    return parent.get_text(" ", strip=True)


def _name_from_card(text: str, href: str) -> str:
    cleaned = re.sub(r"\s+", " ", text)
    cleaned = re.sub(r"^(Discount|Sale)\s+", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\s*Add To Cart.*$", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\s*-?\d+%\s*$", "", cleaned)
    cleaned = re.sub(r"\s*\d+[.,]\d+\s*₾.*$", "", cleaned)
    if len(cleaned) > 8:
        return cleaned.strip()
    slug = href.rstrip("/").split("/")[-1]
    return slug.replace("-", " ").upper()


def _category_pages(start_url: str) -> list[str]:
    pages = [start_url]
    seen = {start_url.rstrip("/")}
    try:
        _, soup = fetch_html(start_url)
    except CollectError:
        return pages
    max_page = 1
    for a in soup.select("a[href]"):
        href = a.get("href") or ""
        m = PAGE_LINK.search(href)
        if m:
            max_page = max(max_page, int(m.group(1)))
    base = start_url.rstrip("/")
    for n in range(2, max_page + 1):
        url = f"{base}?page={n}"
        if url not in seen:
            pages.append(url)
            seen.add(url)
    return pages


def _detail_images(url: str) -> list[str]:
    try:
        html, soup = fetch_html(url)
    except CollectError:
        return []
    imgs: list[str] = []
    for m in DETAIL_IMG.findall(html):
        imgs.append(_abs(m.split("?")[0]))
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if "/upload/Products/" in src:
            imgs.append(_abs(src.split("?")[0]))
    out: list[str] = []
    for u in imgs:
        if u not in out:
            out.append(u)
    return out[:6]


def _parse_amboli_cards(soup, seen: set[str]) -> list[ProductObservation]:
    out: list[ProductObservation] = []
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if not PRODUCT_PATH.search(href):
            continue
        full = _abs(href)
        if full in seen:
            continue
        seen.add(full)
        text = _card_text(anchor)
        name = _name_from_card(text, href)
        nums = [parse_gel(x) for x in re.findall(r"(\d+[.,]\d+|\d+)\s*₾", text)]
        nums = [n for n in nums if n and n > 1]
        price = min(nums) if nums else None
        old = max(nums) if nums and len(nums) > 1 else None
        img = _product_image(anchor)
        brand, vis, vol = _guess(name)
        cat = _guess_category(href, name)
        out.append(
            ProductObservation(
                store_slug="amboli",
                name=name,
                source_url=full,
                price=price,
                old_price=old,
                brand=brand,
                category=cat,
                viscosity=vis,
                volume=vol,
                image_urls=[img] if img else [],
            )
        )
    return out


def collect_amboli() -> list[ProductObservation]:
    out: list[ProductObservation] = []
    seen: set[str] = set()
    for cat_url in AMBOLI_CATEGORIES:
        try:
            for page_url in _category_pages(cat_url):
                try:
                    _, soup = fetch_html(page_url)
                except CollectError:
                    continue
                out.extend(_parse_amboli_cards(soup, seen))
        except CollectError:
            continue
    if not out:
        raise CollectError("amboli: no public product cards parsed from category pages")
    return out


def collect_tegeta() -> list[ProductObservation]:
    url = "https://shop.tegetamotors.ge/ge/home"
    try:
        fetch_html(url)
    except CollectError:
        raise
    raise CollectError("tegeta: page reachable but no public product listing parsed without invented endpoints")


def _json_ld_products(html: str) -> list[dict]:
    out: list[dict] = []
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get("@type") == "Product":
                out.append(item)
    return out


def _ld_price(product: dict) -> float | None:
    offers = product.get("offers") if "offers" in product else product
    if not offers:
        return None
    if isinstance(offers, list):
        offers = offers[0] if offers else None
    if not isinstance(offers, dict):
        return None
    raw = offers.get("price")
    if raw is None:
        return None
    try:
        return float(str(raw).replace(",", "."))
    except ValueError:
        return parse_gel(str(raw))


def _ld_images(data: dict) -> list[str]:
    imgs = data.get("image") or []
    if isinstance(imgs, str):
        return [imgs.split("?")[0]]
    return [str(u).split("?")[0] for u in imgs if u]


def _wc_minor_price(prices: dict | None) -> float | None:
    if not prices:
        return None
    minor = prices.get("currency_minor_unit", 2) or 2
    raw = prices.get("price") or prices.get("regular_price")
    if raw in (None, ""):
        return None
    try:
        return float(raw) / (10 ** int(minor))
    except (TypeError, ValueError):
        return None


def _wc_price(prices: dict | None) -> float | None:
    if not prices:
        return None
    if "currency_minor_unit" in prices:
        return _wc_minor_price(prices)
    raw = prices.get("price") or prices.get("regular_price")
    if raw in (None, ""):
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return parse_gel(str(raw))


def _wc_sale_prices(prices: dict | None) -> tuple[float | None, float | None]:
    if not prices:
        return None, None
    price = _wc_price(prices)
    regular = _wc_price({**prices, "price": prices.get("regular_price")})
    sale = _wc_price({**prices, "price": prices.get("sale_price")})
    old = regular if price and regular and sale and sale < regular else None
    return price, old


def _vika_category(categories: list[dict] | None) -> str | None:
    if not categories:
        return None
    slug = (categories[0].get("slug") or "").lower()
    name = (categories[0].get("name") or "").lower()
    return _guess_category(slug + " " + name, name)


def collect_vika() -> list[ProductObservation]:
    out: list[ProductObservation] = []
    seen: set[str] = set()
    page = 1
    total_pages = 1
    while page <= total_pages:
        url = f"https://vikadpa.ge/wp-json/wc/store/products?per_page=100&page={page}"
        try:
            data, headers = fetch_json(url)
        except CollectError:
            break
        if not isinstance(data, list) or not data:
            break
        total_pages = int(headers.get("x-wp-totalpages") or headers.get("X-WP-TotalPages") or page)
        for item in data:
            permalink = item.get("permalink") or ""
            if not permalink or permalink in seen:
                continue
            seen.add(permalink)
            name = html.unescape((item.get("name") or "").strip())
            if not name:
                continue
            prices = item.get("prices") or {}
            price, old = _wc_sale_prices(prices)
            imgs = [img.get("src") for img in item.get("images") or [] if img.get("src")]
            brand = None
            for b in item.get("brands") or []:
                brand = b.get("name") or brand
            cat = _vika_category(item.get("categories"))
            vis, vol = _guess(name)[1], _guess(name)[2]
            out.append(
                ProductObservation(
                    store_slug="vika-dpa",
                    name=name,
                    source_url=permalink,
                    price=price,
                    old_price=old,
                    available=bool(item.get("is_in_stock", True)),
                    brand=brand or _guess(name)[0],
                    category=cat,
                    sku=item.get("sku") or None,
                    viscosity=vis,
                    volume=vol,
                    image_urls=[u.split("?")[0] for u in imgs[:4]],
                    external_id=str(item.get("id")) if item.get("id") else None,
                )
            )
        page += 1
    if not out:
        raise CollectError("vika: WooCommerce store API returned no products")
    return out


def collect_valvoline() -> list[ProductObservation]:
    out: list[ProductObservation] = []
    seen: set[str] = set()
    page = 1
    total_pages = 1
    while page <= total_pages:
        url = f"https://valvoline.ge/wp-json/wc/store/products?per_page=100&page={page}"
        try:
            data, headers = fetch_json(url)
        except CollectError:
            break
        if not isinstance(data, list) or not data:
            break
        total_pages = int(headers.get("x-wp-totalpages") or headers.get("X-WP-TotalPages") or page)
        for item in data:
            permalink = item.get("permalink") or ""
            if not permalink or permalink in seen:
                continue
            seen.add(permalink)
            name = html.unescape((item.get("name") or "").strip())
            if not name:
                continue
            prices = item.get("prices") or {}
            price, old = _wc_sale_prices(prices)
            imgs = [img.get("src") for img in item.get("images") or [] if img.get("src")]
            brand, vis, vol = _guess(name)
            cat = _guess_category(permalink, name)
            if "coolant" in name.lower() or "antifreeze" in name.lower():
                cat = "antifreeze"
            out.append(
                ProductObservation(
                    store_slug="valvoline",
                    name=name,
                    source_url=permalink,
                    price=price,
                    old_price=old,
                    available=bool(item.get("is_in_stock", True)),
                    brand=brand or "Valvoline",
                    category=cat or "engine-oils",
                    sku=item.get("sku") or None,
                    viscosity=vis,
                    volume=vol,
                    image_urls=[u.split("?")[0] for u in imgs[:4]],
                    external_id=str(item.get("id")) if item.get("id") else None,
                )
            )
        page += 1
    if not out:
        raise CollectError("valvoline: WooCommerce online store API returned no products")
    return out


SHELL_PRODUCT_SLUG = re.compile(
    r'ecommerce-dynamic-product.*?&quot;slug&quot;:\[0,&quot;([^&]+)&quot;\]',
    re.S,
)
AKU_SITEMAP_PRODUCT = re.compile(r"<loc>(https://akumulatori\.ge/products/[^<]+)</loc>")


def collect_shellhouse() -> list[ProductObservation]:
    html, _ = fetch_html("https://shellhousegeorgia.com/")
    slugs: list[str] = []
    seen_slugs: set[str] = set()
    for slug in SHELL_PRODUCT_SLUG.findall(html):
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        slugs.append(slug)
    out: list[ProductObservation] = []
    for slug in slugs:
        url = f"https://shellhousegeorgia.com/{slug}"
        try:
            page_html, _ = fetch_html(url)
        except CollectError:
            continue
        products = _json_ld_products(page_html)
        if not products:
            continue
        product = products[0]
        name = (product.get("name") or slug.replace("-", " ")).strip()
        price = _ld_price(product)
        imgs = _ld_images(product)
        brand, vis, vol = _guess(name)
        out.append(
            ProductObservation(
                store_slug="shell-house",
                name=name,
                source_url=url,
                price=price,
                brand=brand or "Shell",
                category="engine-oils",
                viscosity=vis,
                volume=vol,
                image_urls=imgs[:4],
                available=price is not None,
            )
        )
    if not out:
        raise CollectError("shellhouse: no ecommerce product pages with JSON-LD prices")
    return out


def collect_akumulatori() -> list[ProductObservation]:
    sitemap, _ = fetch_html("https://akumulatori.ge/sitemap.xml")
    urls = [u for u in AKU_SITEMAP_PRODUCT.findall(sitemap) if "/en/" not in u]
    out: list[ProductObservation] = []
    seen: set[str] = set()
    for url in urls:
        if url in seen:
            continue
        seen.add(url)
        try:
            page_html, _ = fetch_html(url)
        except CollectError:
            continue
        products = _json_ld_products(page_html)
        if not products:
            continue
        product = products[0]
        name = (product.get("name") or "").strip()
        if not name:
            continue
        price = _ld_price(product)
        imgs = _ld_images(product)
        brand = name.split(" ")[0] if name else None
        out.append(
            ProductObservation(
                store_slug="akumulatori",
                name=name,
                source_url=url,
                price=price,
                brand=brand,
                category="batteries",
                sku=product.get("sku"),
                image_urls=imgs[:4],
                available=price is not None,
            )
        )
    if not out:
        raise CollectError("akumulatori: sitemap product pages have no JSON-LD offers")
    return out


PRODUCT_COLLECTORS = {
    "amboli": collect_amboli,
    "tegeta": collect_tegeta,
    "vika": collect_vika,
    "valvoline": collect_valvoline,
    "shellhouse": collect_shellhouse,
    "akumulatori": collect_akumulatori,
}
