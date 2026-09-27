import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import ProductCardView from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";

export default async function StoreDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await api.storeSlug(slug).catch(() => null);
  if (!store) notFound();
  const products = await api.products({ storeId: store.id, size: 24 }).catch(() => ({ items: [] }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{store.name}</h1>
          <a className="text-sm text-teal-600" href={store.websiteUrl} target="_blank" rel="noreferrer">
            {store.websiteUrl}
          </a>
        </div>
        <FavoriteButton itemType="store" itemId={store.id} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.items.map((p) => (
          <ProductCardView key={p.id} p={p} />
        ))}
      </div>
      {products.items.length === 0 && <div className="text-slate-400 py-16 text-center">ამ მაღაზიაში ჯერ არ არის შეთავაზება.</div>}
    </div>
  );
}
