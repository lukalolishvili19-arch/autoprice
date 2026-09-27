import Link from "next/link";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { IconChevronRight } from "@/components/Icons";

export const metadata = { title: "მაღაზიები" };

export default async function StoresPage() {
  const stores = await api.stores().catch(() => []);
  const companies = await api.fuelCompanies().catch(() => []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">მაღაზიები და ქსელები</h1>
        <p className="text-slate-400 text-sm mt-1">Stores & Fuel Networks</p>
      </div>
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-teal-600 rounded-full" />
          <h2 className="text-lg font-extrabold text-slate-900">ავტომობილის მაღაზიები</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((s) => (
            <Link key={s.id} href={`/stores/${s.slug}`} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-teal-200 transition-all group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-50 rounded-xl flex items-center justify-center font-extrabold text-slate-600 group-hover:text-teal-700 text-sm overflow-hidden">
                  {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="w-8 h-8 object-contain" /> : s.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-400">ავტო-მაღაზია</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">პროდუქტები</div>
                  <div className="font-extrabold text-slate-900 font-mono text-lg">{s.productCount}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">განახლდა</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">{timeAgo(s.lastChecked)}</div>
                </div>
              </div>
              <span className="text-xs text-teal-600 font-bold flex items-center gap-1">მაღაზიის ნახვა <IconChevronRight /></span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h2 className="text-lg font-extrabold text-slate-900">საწვავის ქსელები</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <Link key={c.slug} href={`/fuel/companies/${c.slug}`} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${c.colorDot} rounded-xl flex items-center justify-center font-extrabold text-white text-sm`}>
                  {c.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400">{timeAgo(c.lastChecked)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                {["regular", "premium", "diesel"].map((k) => (
                  <div key={k} className="bg-slate-50 rounded-xl py-2.5 px-1">
                    <div className="text-[10px] text-slate-400">{k}</div>
                    <div className="font-extrabold font-mono text-sm">{c.prices[k]?.toFixed(2) ?? "—"} ₾</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-center">სადგურები</span>
                <span className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-center">ისტორია</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
