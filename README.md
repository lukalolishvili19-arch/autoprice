# AutoPrice Georgia

Georgian automotive + fuel price comparison. The Figma Make UI is the visual source of truth.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind 4
- Backend: Java 21, Spring Boot 3.4, JPA, Flyway, Redis-ready
- DB: PostgreSQL 16
- Collectors: Python 3.12, Requests, BeautifulSoup, Playwright (optional), FastAPI
- Docker Compose for all services

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:8080/api/health
- Collectors: http://localhost:8090/health
- Admin UI: http://localhost:3000/admin (HTTP Basic, default `admin` / `changeme`)

Trigger collectors:

```bash
curl -u admin:changeme -X POST http://localhost:8080/api/admin/collectors/fuel
curl -u admin:changeme -X POST http://localhost:8080/api/admin/collectors/products
```

## Local development

### PostgreSQL

```bash
docker compose up -d postgres redis
```

### Backend

```bash
cd backend
# Java 21 required
mvn test
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Collectors

```bash
cd collectors
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests
uvicorn src.app:app --port 8090
```

## Data sources

Collectors only use publicly visible HTML. They do **not** bypass Cloudflare, CAPTCHA, or login.

| Source | Notes (inspected) |
| --- | --- |
| Wissol, Gulf, SOCAR, Rompetrol, Portal, Lukoil | Public fuel price pages/tables |
| Amboli | Public homepage product cards |
| Tegeta shop | Cloudflare-protected — collector records an error |
| Valvoline.ge | Service centers, no public catalog |
| Vika DPA / Shell House / Akumulatori | Parsed only if product links are public |

Product images come from source `img` URLs when the collector can see them. Missing images use the UI fallback (initials), never invented photos.

Unavailable stores always remain on the comparison list.

## Matching

EAN → SKU/part → brand+name+volume → brand+viscosity+volume+name → fuzzy. Fuzzy never auto-merges.

## Tests

```bash
cd backend && mvn test
cd collectors && python -m pytest tests
cd frontend && npm run build
```
