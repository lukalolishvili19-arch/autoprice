import Link from "next/link";
import { api } from "@/lib/api";

export const metadata = { title: "კატეგორიები" };

export default async function CategoriesPage() {
  const cats = await api.categories().catch(() => []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">კატეგორიები</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cats.map((cat) => (
          <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className={`${cat.bgClass} ${cat.borderClass} border rounded-xl p-4 hover:shadow-md`}>
            <div className="text-2xl mb-2">{cat.icon}</div>
            <div className="text-sm font-bold text-slate-800">{cat.nameKa}</div>
            <div className="text-[11px] text-slate-500 font-mono">{cat.productCount}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
