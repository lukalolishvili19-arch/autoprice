import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import FavoriteButton from "@/components/FavoriteButton";

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await api.station(id).catch(() => null);
  if (!s) notFound();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold">{s.name}</h1>
        <p className="text-slate-400 text-sm">{s.companyName} · {s.city} {s.address}</p>
        {s.latitude != null && <p className="text-xs font-mono mt-2">{s.latitude}, {s.longitude}</p>}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {Object.entries(s.prices).map(([k, v]) => (
            <div key={k} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400">{k}</div>
              <div className="font-mono font-extrabold">{v.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <FavoriteButton itemType="station" itemId={s.id} />
        </div>
      </div>
    </div>
  );
}
