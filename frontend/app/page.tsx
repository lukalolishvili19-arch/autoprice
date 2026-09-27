import Link from "next/link";
import { api, type Category, type FuelSummary, type Page, type ProductCard } from "@/lib/api";
import { gel } from "@/lib/format";
import ProductCardView from "@/components/ProductCard";
import { IconChevronRight, IconFuel, IconSearch } from "@/components/Icons";

export const metadata = { title: "მთავარი" };

export default async function HomePage() {
  let products: Page<ProductCard> = { items: [], page: 0, size: 6, total: 0, totalPages: 0 };
  let categories: Category[] = [];
  let fuel: FuelSummary | null = null;

  const [productsRes, categoriesRes, fuelRes] = await Promise.allSettled([
    api.products({ sort: "popular", size: 6 }),
    api.categories(),
    api.fuelPrices("regular"),
  ]);
  if (productsRes.status === "fulfilled") products = productsRes.value;
  if (categoriesRes.status === "fulfilled") categories = categoriesRes.value;
  if (fuelRes.status === "fulfilled") fuel = fuelRes.value;

  const cheap = fuel?.cheapest;

  return (
    <div>
      <section className="relative bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?w=1400&h=700&fit=crop&auto=format')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/25 rounded-full px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-300 text-xs font-semibold tracking-wide">ფასები განახლდება რეგულარულად</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-4">
              იპოვე <span className="text-teal-400">საუკეთესო</span>
              <br />
              ფასი ავტომობილისთვის
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              შეადარე ავტოპროდუქტებისა და საწვავის ფასები საქართველოს მასშტაბით ერთ ადგილას.
            </p>
            <form action="/products" className="flex gap-3 flex-col sm:flex-row max-w-xl">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <IconSearch />
                </div>
                <input
                  name="q"
                  placeholder="მოძებნე პროდუქტი, ზეთი, აკუმულატორი..."
                  className="w-full bg-white/8 border border-white/15 text-white placeholder:text-slate-600 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors text-sm">ძებნა</button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {["Totachi 5W-30", "Wolf 5W-30", "OEM Honda", "Goodyear"].map((q) => (
                <Link key={q} href={`/products?q=${encodeURIComponent(q)}`} className="text-xs text-slate-500 hover:text-teal-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-slate-100">
            {[
              { v: "6+", l: "ავტო-მაღაზია", s: "Tegeta, Amboli, Vika..." },
              { v: "6+", l: "საწვავის ქსელი", s: "Wissol, SOCAR, Gulf..." },
              { v: String(products.total ?? products.items.length), l: "პროდუქტი", s: "ყველა კატეგორია" },
              { v: "—", l: "სადგური", s: "კოორდინატები წყაროდან" },
              { v: "რეგულარული", l: "განახლება", s: "შეგროვებული ფასები" },
            ].map((stat, i) => (
              <div key={i} className={`px-4 sm:px-6 first:pl-0 last:pr-0 ${i >= 4 ? "hidden lg:block" : ""} ${i >= 2 ? "hidden sm:block" : ""}`}>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stat.v}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">{stat.l}</div>
                <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{stat.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          <Link href="/products" className="group relative bg-slate-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-300">
            <div className="relative p-8">
              <div className="w-11 h-11 bg-teal-600/25 border border-teal-500/30 rounded-xl flex items-center justify-center mb-5">
                <IconSearch />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1.5">ავტოპროდუქტების ფასები</h2>
              <p className="text-slate-400 text-sm mb-5">შეადარე ზეთების, ფილტრების, აკუმულატორების ფასები 6 მაღაზიაში</p>
              <div className="mt-5 flex items-center gap-2 text-teal-400 text-sm font-semibold group-hover:gap-3 transition-all">
                <span>პროდუქტების ნახვა</span>
                <IconChevronRight />
              </div>
            </div>
          </Link>
          <Link href="/fuel" className="group relative bg-slate-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-300">
            <div className="relative p-8">
              <div className="w-11 h-11 bg-amber-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center mb-5 text-amber-400">
                <IconFuel />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1.5">საწვავის ფასები</h2>
              <p className="text-slate-400 text-sm mb-5">შეადარე Regular, Premium, Diesel ფასები 6 ქსელში</p>
              <div className="bg-white/5 border border-white/8 rounded-xl px-5 py-4">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-3">Regular</div>
                <div className="text-4xl font-extrabold text-white font-mono leading-none">
                  {cheap ? cheap.price.toFixed(2) : "—"} <span className="text-amber-400 text-2xl">₾</span>
                </div>
                <div className="text-xs text-slate-400 mt-1.5">
                  <span className="text-emerald-400 font-bold">{cheap?.name}</span> · ყველაზე იაფი
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">კატეგორიები</h2>
            <p className="text-slate-400 text-xs mt-0.5">Product Categories</p>
          </div>
          <Link href="/categories" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
            ყველა <IconChevronRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className={`${cat.bgClass} ${cat.borderClass} border rounded-xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-bold text-slate-800 leading-snug">{cat.nameKa}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">{cat.productCount}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">პოპულარული პროდუქტები</h2>
              <p className="text-slate-400 text-xs mt-0.5">Popular Products</p>
            </div>
            <Link href="/products" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              ყველა <IconChevronRight />
            </Link>
          </div>
          {products.items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">მონაცემები იტვირთება API-დან ან კოლექტორებიდან.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.items.map((p) => (
                <ProductCardView key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
