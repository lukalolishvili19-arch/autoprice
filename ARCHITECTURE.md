# AutoPrice Georgia — Architecture

The Figma Make prototype (`Build-it-now`, file `IhJHzxNUl8LwZhxqHRnwdW`) is the **final UI**. This repo converts that prototype into a production application without changing visual identity.

## Existing frontend (source of truth)

Single-file React + Tailwind 4 prototype. Visual tokens that must be preserved:

| Token | Value |
| --- | --- |
| Brand | AutoPrice / საქართველო |
| Accent | Teal (`bg-teal-600`, `#0d9488`) |
| Fuel accent | Amber |
| Page bg | `bg-slate-50` |
| Header | Sticky white/96, `h-16`, backdrop blur |
| Type | Outfit + Noto Sans Georgian; DM Mono for prices |
| Cards | `rounded-2xl`, `border-slate-200` |
| Buttons | `rounded-xl` |
| Logo | `w-9 h-9 bg-teal-600 rounded-xl` bar-chart icon |
| Mobile nav | Fixed bottom, 5 items |

Prototype views: `home`, `products`, `fuel`, `comparison`, `stores` plus header, mobile nav, product cards.

Missing Figma frames (same visual system, not a redesign): product detail, categories, store detail, fuel map, fuel company/station detail, favorites, alerts, dashboard, login, admin, loading/error/empty.

## Data flow

```
Source websites
  → Python collectors (requests / BeautifulSoup / Playwright)
  → normalize + master-product matching
  → PostgreSQL
  → Spring Boot REST API (+ Redis cache)
  → Next.js frontend
```

Scraping never lives in the frontend.

## Layout

```
frontend/     Next.js 15 App Router, React, TypeScript, Tailwind 4
backend/      Java 21, Spring Boot 3, JPA, Flyway, Redis
collectors/   Python 3.12, requests, bs4, playwright
docker-compose.yml
```

## Domain

- **Master product** — one canonical product; offers from all six stores always listed (unavailable stays visible).
- **Offer** — store-specific price, availability, URL, `last_checked`.
- **Price history** — append-only observations; never overwrite.
- **Matching** — EAN → SKU/part → brand+name+volume → brand+viscosity+volume+name → controlled fuzzy. Low confidence is never auto-merged.
- **Fuel** — company, station (coords only if real), type (regular/premium/super/diesel/lpg/cng), price, timestamp, history.

## API (prefix `/api`)

Products: `GET /products`, `/products/search`, `/products/{id}`, `/products/{id}/offers`, `/products/{id}/price-history`, `/products/{id}/similar`  
Stores: `GET /stores`, `/stores/{id}`  
Taxonomy: `GET /categories`, `/brands`  
Fuel: `GET /fuel/prices`, `/fuel/history`, `/fuel/companies`, `/fuel/stations`, `/fuel/stations/{id}`  
User: favorites + price alerts  
Admin (`/api/admin`, basic auth): stores, scrape runs/errors, products, matches, collector trigger

## Collectors (inspect-first)

Prefer public HTML/JSON already on the page. Do not invent APIs. Do not bypass CAPTCHA, login, or anti-bot.

**Products:** Tegeta shop, Amboli, Vika DPA, Valvoline.ge, Shell House Georgia, Akumulatori.ge  
**Fuel (inspected):** Wissol published HTML prices; Gulf published dated HTML table. SOCAR (`sgp.ge/price-archive`), Rompetrol, Portal, Lukoil inspected per collector.

## Security

Secrets only in env. CORS to the Next origin. Admin endpoints protected. Collectors run as a separate service. No access-control bypass.

## Performance

Paginated product lists. Redis cache on list/fuel endpoints. Lazy images with fallback. Frontend never loads the full catalog.
