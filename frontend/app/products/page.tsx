import Link from "next/link";
import { api } from "@/lib/api";
import ProductCardView from "@/components/ProductCard";
import { IconSearch } from "@/components/Icons";

export const metadata = { title: "პროდუქტები" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const categoryId = sp.categoryId;
  const sort = sp.sort ?? "popular";
  const page = Number(sp.page ?? 0);
  let data: Awaited<ReturnType<typeof api.products>> = { items: [], page: 0, size: 24, total: 0, totalPages: 0 };
  let categories: Awaited<ReturnType<typeof api.categories>> = [];
  try {
    [data, categories] = await Promise.all([
      api.products({ q, categoryId, sort, page, size: 24 }),
      api.categories(),
    ]);
  } catch {
    /* empty */
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">პროდუქტები</h1>
        <p className="text-slate-400 text-sm mt-1">შეადარე ფასები 6 ავტო-მაღაზიაში</p>
      </div>
      <form className="relative mb-5">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch />
        </div>
        <input
          name="q"
          defaultValue={q}
          placeholder="მოძებნე პროდუქტი, ბრენდი, სპეციფიკაცია..."
          className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </form>
      <div className="flex gap-2 flex-wrap mb-4">
        <Link href="/products" className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${!categoryId ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
          ყველა
        </Link>
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              String(cat.id) === categoryId ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.nameKa}</span>
          </Link>
        ))}
      </div>
      <div className="flex gap-2 mb-6 text-xs">
        {[
          ["popular", "პოპულარული"],
          ["cheapest", "იაფი"],
          ["expensive", "ძვირი"],
          ["updated", "განახლებული"],
        ].map(([id, label]) => (
          <Link key={id} href={`/products?sort=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`} className={`px-3 py-1.5 rounded-lg font-bold ${sort === id ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {label}
          </Link>
        ))}
      </div>
      {data.items.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🔍</div>
          <div className="font-semibold text-slate-600">პროდუქტი ვერ მოიძებნა</div>
          <div className="text-sm mt-1">სცადე სხვა საძიებო სიტყვა</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((p) => (
            <ProductCardView key={p.id} p={p} />
          ))}
        </div>
      )}
      {data.totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-8">
          {Array.from({ length: data.totalPages }).slice(0, 8).map((_, i) => (
            <Link key={i} href={`/products?page=${i}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${i === page ? "bg-teal-600 text-white" : "bg-white border border-slate-200"}`}>
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
