export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function serverApiUrl() {
  return process.env.BACKEND_INTERNAL_URL || API_URL;
}

export type PriceStats = {
  cheapest: number | null;
  highest: number | null;
  average: number | null;
  savings: number | null;
  availableStoreCount: number;
};

export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  spec?: string;
  volume: string | null;
  viscosity: string | null;
  categorySlug: string | null;
  primaryImage: string | null;
  prices: PriceStats;
  lastChecked: string | null;
};

export type Offer = {
  storeId: number;
  storeSlug: string;
  storeName: string;
  logoUrl: string | null;
  price: number | null;
  oldPrice: number | null;
  currency: string;
  available: boolean;
  productUrl: string | null;
  lastChecked: string | null;
  cheapest: boolean;
};

export type ProductDetail = ProductCard & {
  description: string | null;
  sku: string | null;
  ean: string | null;
  partNumber: string | null;
  unit: string | null;
  compatibility: string | null;
  categoryKa: string;
  categoryEn: string;
  images: { url: string; alt: string | null; primary: boolean }[];
  attributes: Record<string, string>;
  offers: Offer[];
};

export type Category = {
  id: number;
  slug: string;
  nameKa: string;
  nameEn: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  productCount: number;
};

export type Store = {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  websiteUrl: string;
  logoUrl: string | null;
  lastChecked: string | null;
  productCount: number;
};

export type FuelRow = {
  companyId: number;
  slug: string;
  name: string;
  colorDot: string;
  chartColor: string;
  price: number;
  lastChecked: string | null;
  stationCount: number | null;
  sourceUrl: string | null;
};

export type FuelSummary = {
  fuelType: string;
  cheapest: FuelRow | null;
  highest: FuelRow | null;
  average: number | null;
  difference: number | null;
  change30d: number | null;
  rows: FuelRow[];
};

export type FuelCompany = {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string;
  colorDot: string;
  chartColor: string;
  stationCount: number | null;
  lastChecked: string | null;
  prices: Record<string, number>;
};

export type FuelStation = {
  id: number;
  companyId: number;
  companySlug: string;
  companyName: string;
  name: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  lastChecked: string | null;
  prices: Record<string, number>;
};

export type SearchHit = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  cheapest: number | null;
};

export type Page<T> = { items: T[]; page: number; size: number; total: number; totalPages: number };

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window === "undefined" ? serverApiUrl() : API_URL;
  const res = await fetch(`${base}${path}`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json();
}

export const api = {
  products: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
    });
    return get<Page<ProductCard>>(`/api/products?${q}`);
  },
  search: (q: string) => get<SearchHit[]>(`/api/products/search?q=${encodeURIComponent(q)}`),
  product: (id: string | number) => get<ProductDetail>(`/api/products/${id}`),
  similar: (id: string | number) => get<ProductCard[]>(`/api/products/${id}/similar`),
  history: (id: string | number) => get<{ at: string; store: string; price: number }[]>(`/api/products/${id}/price-history`),
  stores: () => get<Store[]>("/api/stores"),
  store: (id: string) => get<Store>(`/api/stores/${id}`),
  storeSlug: (slug: string) => get<Store>(`/api/stores/slug/${slug}`),
  categories: () => get<Category[]>("/api/categories"),
  brands: () => get<{ id: number; slug: string; name: string }[]>("/api/brands"),
  fuelPrices: (type = "regular", sort = "cheapest") =>
    get<FuelSummary>(`/api/fuel/prices?type=${type}&sort=${sort}`),
  fuelHistory: (type = "regular", range = "30d") =>
    get<{ at: string; companySlug: string; price: number }[]>(`/api/fuel/history?type=${type}&range=${range}`),
  fuelCompanies: () => get<FuelCompany[]>("/api/fuel/companies"),
  fuelCompany: (slug: string) => get<FuelCompany>(`/api/fuel/companies/${slug}`),
  stations: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params);
    return get<FuelStation[]>(`/api/fuel/stations?${q}`);
  },
  station: (id: string) => get<FuelStation>(`/api/fuel/stations/${id}`),
};

export function clientHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  let key = localStorage.getItem("ap-client");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("ap-client", key);
  }
  return { "X-Client-Key": key, "Content-Type": "application/json" };
}

export async function toggleFavorite(itemType: string, itemId: number, on: boolean) {
  const headers = clientHeaders();
  if (on) {
    await fetch(`${API_URL}/api/favorites/${itemType}/${itemId}`, { method: "DELETE", headers });
  } else {
    await fetch(`${API_URL}/api/favorites`, {
      method: "POST",
      headers,
      body: JSON.stringify({ itemType, itemId }),
    });
  }
}

export async function createAlert(body: Record<string, unknown>) {
  return fetch(`${API_URL}/api/alerts`, {
    method: "POST",
    headers: clientHeaders(),
    body: JSON.stringify(body),
  }).then((r) => r.json());
}
