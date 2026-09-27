from __future__ import annotations

from fastapi import FastAPI

from .fuel import COLLECTORS as FUEL, collect_all_fuel
from .ingest import save_fuel, save_products, save_stations
from .dedup import dedupe_products
from .enrich_images import enrich_missing_images
from .products import PRODUCT_COLLECTORS
from .stations import STATION_COLLECTORS

app = FastAPI(title="AutoPrice Collectors")


@app.get("/health")
def health():
    return {"ok": True, "collectors": {"fuel": list(FUEL), "products": list(PRODUCT_COLLECTORS), "stations": list(STATION_COLLECTORS)}}


@app.post("/collect/fuel")
def collect_fuel():
    errors: list[str] = []
    obs = []
    for name, fn in FUEL.items():
        try:
            obs.extend(fn())
        except Exception as e:
            errors.append(f"{name}: {e}")
    return save_fuel(obs, errors)


@app.post("/collect/products")
def collect_products():
    errors: list[str] = []
    obs = []
    for name, fn in PRODUCT_COLLECTORS.items():
        try:
            obs.extend(fn())
        except Exception as e:
            errors.append(f"{name}: {e}")
    return save_products(obs, errors)


@app.post("/collect/stations")
def collect_stations():
    errors: list[str] = []
    rows: list[dict] = []
    for name, fn in STATION_COLLECTORS.items():
        try:
            rows.extend(fn())
        except Exception as e:
            errors.append(f"{name}: {e}")
    return save_stations(rows, errors)


@app.post("/dedupe/products")
def dedupe():
    return dedupe_products()


@app.post("/enrich/images")
def enrich_images():
    return enrich_missing_images()


@app.post("/collect/{name}")
def collect_named(name: str):
    if name == "fuel":
        return collect_fuel()
    if name == "products":
        return collect_products()
    if name == "stations":
        return collect_stations()
    if name in FUEL:
        try:
            obs = FUEL[name]()
            return save_fuel(obs, [])
        except Exception as e:
            return save_fuel([], [str(e)])
    if name in PRODUCT_COLLECTORS:
        try:
            obs = PRODUCT_COLLECTORS[name]()
            return save_products(obs, [])
        except Exception as e:
            return save_products([], [str(e)])
    return {"status": "FAILED", "message": f"unknown collector {name}"}
