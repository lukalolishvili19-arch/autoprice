import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

export default async function FuelCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await api.fuelCompany(slug).catch(() => null);
  if (!c) notFound();
  const stations = await api.stations({ companyId: String(c.id) }).catch(() => []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 flex justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{c.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{timeAgo(c.lastChecked)} · {c.websiteUrl}</p>
        </div>
        <FavoriteButton itemType="fuel_network" itemId={c.id} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {Object.entries(c.prices).map(([k, v]) => (
          <div key={k} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{k}</div>
            <div className="font-mono font-extrabold text-2xl">{v.toFixed(2)} ₾</div>
          </div>
        ))}
      </div>
      <h2 className="font-extrabold mb-3">სადგურები</h2>
      {stations.length === 0 ? (
        <p className="text-slate-400 text-sm">სადგურები მხოლოდ მაშინ ჩანს, როცა წყარო იძლევა მისამართს/კოორდინატებს. არ ვიგონებთ წერტილებს.</p>
      ) : (
        <div className="space-y-3">
          {stations.map((s) => (
            <Link key={s.id} href={`/fuel/stations/${s.id}`} className="block bg-white border rounded-2xl p-4">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-slate-400">{s.city} {s.address}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
