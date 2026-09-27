import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import FuelMap from "@/components/FuelMap";

export const metadata = { title: "საწვავის რუკა" };

export default async function FuelMapPage() {
  const stations = await api.stations().catch(() => []);
  const withCoords = stations.filter((s) => s.latitude != null && s.longitude != null) as {
    id: number;
    companyName: string;
    name: string;
    latitude: number;
    longitude: number;
  }[];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">საწვავი ჩემთან ახლოს</h1>
      <p className="text-slate-400 text-sm mb-6">
        {withCoords.length > 0
          ? `${withCoords.length} სადგური რეალური კოორდინატებით`
          : "მარკერები მხოლოდ რეალური კოორდინატებით."}
      </p>
      <FuelMap stations={withCoords} />
      <div className="space-y-3 mt-6">
        {stations.map((s) => (
          <a key={s.id} href={`/fuel/stations/${s.id}`} className="block bg-white border rounded-2xl p-4">
            <div className="font-bold">{s.companyName} · {s.name}</div>
            <div className="text-xs text-slate-400">{s.city} · {timeAgo(s.lastChecked)}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
