# Implementation TODO

## Core platform
- [x] 1. Existing frontend analysis (see ARCHITECTURE.md)
- [x] 2. Database (Flyway V1 schema + V2/V3 seed)
- [x] 3. Spring Boot backend APIs
- [x] 4. Product collectors (inspect sources first)
- [x] 5. Product matching engine
- [x] 6. Fuel collectors
- [x] 7. Frontend API integration (Figma UI preserved)
- [x] 8. Favorites
- [x] 9. Alerts
- [x] 10. Price history
- [x] 11. Fuel map (Leaflet + coords when source provides)
- [x] 12. Docker Compose + `.env.example`
- [x] 13. Tests (frontend build, collectors pytest, backend mvn via Docker)
- [x] 14. Docker end-to-end verification (Flyway, APIs, SSR)

## Data enrichment (collectors)
- [x] 15. Amboli category-page collector with real product images (`/upload/Products/`)
- [x] 16. Lukoil station list (address/city; no coords on public page)
- [x] 17. Portal station coordinates from public RSC payload
- [x] 18. Tegeta shop — Cloudflare blocked; error logged, no bypass (documented in README)
- [x] 19. Valvoline.ge — service centers only; no public catalog (documented in README)
- [x] 20. Deduplicate collector-created product duplicates vs seed masters (matching + `/dedupe/products`)

## Verification gates (goal evidence)
- [x] Frontend `npm run build` passes
- [x] Backend builds in Docker
- [x] Flyway migrations apply
- [x] Products API + unavailable stores visible in offers
- [x] Fuel prices + history APIs
- [x] Search / sort / category filters
- [x] 67+ real product images ingested from Amboli
- [x] Fuel map shows Portal markers after station ingest
- [x] Favorites + alerts smoke test via API
- [x] Full mobile pass in browser (products + fuel map responsive layout verified)

After each major phase: run tests, run build, fix errors, continue.
