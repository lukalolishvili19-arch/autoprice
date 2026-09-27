import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { IconChevronRight, IconExternalLink, IconTrendDown } from "@/components/Icons";
import ProductImage from "@/components/ProductImage";
import ProductCardView from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";
import AlertForm from "@/components/AlertForm";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await api.product(id);
    return {
      title: p.name,
      description: `${p.brand} ${p.name} — ყველაზე დაბალი ფასი ${p.prices.cheapest ?? "—"} ₾`,
      openGraph: { title: p.name, description: p.brand },
      alternates: { canonical: `/products/${id}` },
    };
  } catch {
    return { title: "პროდუქტი" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let p: Awaited<ReturnType<typeof api.product>>;
  try {
    p = await api.product(id);
  } catch {
    notFound();
  }
  const similar = await api.similar(id).catch(() => []);
  const primary = p.images.find((i) => i.primary)?.url ?? p.images[0]?.url ?? p.primaryImage;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            brand: p.brand,
            image: p.images.map((i) => i.url),
            offers: p.offers.filter((o) => o.available && o.price != null).map((o) => ({
              "@type": "Offer",
              url: o.productUrl,
              price: o.price,
              priceCurrency: o.currency,
              availability: "https://schema.org/InStock",
              seller: o.storeName,
            })),
          }),
        }}
      />
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/products">პროდუქტები</Link>
        <IconChevronRight />
        <span>{p.categoryKa}</span>
        <IconChevronRight />
        <span className="text-slate-700 font-semibold">{p.brand} {p.name}</span>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:sticky lg:top-24">
            <div className="bg-slate-50 rounded-xl h-52 flex items-center justify-center overflow-hidden mb-3 relative">
              <ProductImage src={primary} alt={p.name} className="h-full w-full object-contain p-6" />
            </div>
            {p.images.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {p.images.map((img) => (
                  <div key={img.url} className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductImage src={img.url} alt={img.alt || p.name} className="w-full h-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
            <div className="text-[11px] font-extrabold text-teal-600 uppercase tracking-widest mb-0.5">{p.brand}</div>
            <h1 className="font-extrabold text-slate-900 text-lg">{p.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{p.spec}</p>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-medium mb-1">ყველაზე დაბალი ფასი</div>
              <div className="text-4xl font-extrabold text-teal-600 font-mono leading-none">
                {p.prices.cheapest ?? "—"} <span className="text-2xl">₾</span>
              </div>
              {p.prices.savings != null && p.prices.savings > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded-xl">
                  <IconTrendDown />
                  დაზოგავ {p.prices.savings} ₾-მდე
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <FavoriteButton itemType="product" itemId={p.id} />
            </div>
            <div className="mt-4">
              <AlertForm productId={p.id} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900">მაღაზიების შედარება</h2>
              <p className="text-xs text-slate-400 mt-0.5">ყველა მაღაზია ჩანს, მათ შორის სადაც პროდუქტი არ არის</p>
            </div>
            <div className="divide-y divide-slate-100">
              {p.offers.map((store) => (
                <div key={store.storeId} className={`px-6 py-4 flex items-center gap-4 ${store.cheapest ? "bg-teal-50" : !store.available ? "opacity-50" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${store.cheapest ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {store.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={store.logoUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      store.storeName.slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 truncate">{store.storeName}</span>
                      {store.cheapest && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-extrabold">ყველაზე იაფი</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{timeAgo(store.lastChecked)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {store.available && store.price != null ? (
                      <>
                        <div className={`font-extrabold font-mono text-xl leading-none ${store.cheapest ? "text-teal-700" : "text-slate-900"}`}>{store.price} ₾</div>
                        <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">ხელმისაწვდომია</div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">არ არის ხელმისაწვდომი</div>
                    )}
                  </div>
                  {store.available && store.productUrl && (
                    <a href={store.productUrl} target="_blank" rel="noopener noreferrer" className={`hidden sm:flex flex-shrink-0 items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl ${store.cheapest ? "bg-teal-600 text-white" : "border border-slate-200 text-slate-600"}`}>
                      ყიდვა <IconExternalLink />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900">სპეციფიკაციები</h3>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries({ ბრენდი: p.brand, ვისკოზიტეტი: p.viscosity, მოცულობა: p.volume, SKU: p.sku, EAN: p.ean, ...p.attributes }).filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</div>
                  <div className="font-bold text-slate-900 text-sm mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
          {similar.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-900 mb-3">მსგავსი</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {similar.map((s) => (
                  <ProductCardView key={s.id} p={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
