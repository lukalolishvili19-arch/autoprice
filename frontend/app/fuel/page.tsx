"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, type FuelCompany, type FuelSummary } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { IconChevronRight, IconLocation, IconTrendDown } from "@/components/Icons";
import AlertForm from "@/components/AlertForm";

const TYPES = [
  { id: "regular", label: "Regular", ge: "ჩვეულებრივი" },
  { id: "premium", label: "Premium", ge: "პრემიუმი" },
  { id: "super", label: "Super", ge: "სუპერი" },
  { id: "diesel", label: "Diesel", ge: "დიზელი" },
  { id: "lpg", label: "LPG", ge: "გაზი" },
  { id: "cng", label: "CNG", ge: "CNG" },
];

export default function FuelDashboard() {
  const [type, setType] = useState("regular");
  const [range, setRange] = useState("30d");
  const [summary, setSummary] = useState<FuelSummary | null>(null);
  const [companies, setCompanies] = useState<FuelCompany[]>([]);
  const [history, setHistory] = useState<{ at: string; companySlug: string; price: number }[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    Promise.all([api.fuelPrices(type), api.fuelCompanies(), api.fuelHistory(type, range)])
      .then(([s, c, h]) => {
        setSummary(s);
        setCompanies(c);
        setHistory(h);
        if (active.length === 0) setActive([...c.map((x) => x.slug), "avg"]);
      })
      .catch((e) => setErr(String(e)));
  }, [type, range]);

  const chart = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    for (const p of history) {
      const key = p.at.slice(0, 10);
      const row = byDate.get(key) ?? { date: key };
      row[p.companySlug] = p.price;
      byDate.set(key, row);
    }
    const rows = [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    for (const row of rows) {
      const nums = Object.entries(row)
        .filter(([k]) => k !== "date")
        .map(([, v]) => Number(v))
        .filter((n) => !Number.isNaN(n));
      if (nums.length) row.avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    return rows;
  }, [history]);

  const cheapest = summary?.cheapest;
  const most = summary?.highest;
  const colors = Object.fromEntries(companies.map((c) => [c.slug, c.chartColor]));
  colors.avg = "#0d9488";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-slate-900">საწვავის ფასები საქართველოში</h1>
        <p className="text-slate-500 text-sm mt-1.5">შეადარე საწვავის მიმდინარე ფასები და ნახე როგორ იცვლებოდა ფასი დროთა განმავლობაში.</p>
      </div>
      {err && <div className="mb-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">API მიუწვდომელია. გაუშვი backend.</div>}
      <div className="flex gap-2 flex-wrap mb-7">
        {TYPES.map((ft) => (
          <button
            key={ft.id}
            onClick={() => setType(ft.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              type === ft.id ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"
            }`}
          >
            {ft.label}
            <span className={`ml-1.5 text-xs font-medium ${type === ft.id ? "opacity-70" : "opacity-50"}`}>{ft.ge}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="col-span-2 sm:col-span-1 bg-teal-600 rounded-2xl p-5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">დღეს ყველაზე იაფი</div>
          <div className="text-4xl font-extrabold font-mono leading-none">
            {cheapest?.price.toFixed(2) ?? "—"}
            <span className="text-teal-200 text-2xl"> ₾</span>
          </div>
          <div className="text-sm opacity-75 mt-1.5 font-semibold">{cheapest?.name}</div>
          <div className="mt-3 flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 text-xs">
            <IconLocation />
            <span>ქსელის საჯარო ფასი</span>
          </div>
        </div>
        {[
          { label: "საშუალო ბაზარი", value: summary?.average != null ? summary.average.toFixed(2) + " ₾" : "—", sub: "Market Average" },
          { label: "ყველაზე დაბალი", value: cheapest ? cheapest.price.toFixed(2) + " ₾" : "—", sub: cheapest?.name ?? "" },
          { label: "ყველაზე მაღალი", value: most ? most.price.toFixed(2) + " ₾" : "—", sub: most?.name ?? "" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono leading-none">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1.5 font-medium">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900">ფასების შედარება</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[...(summary?.rows ?? [])].sort((a, b) => a.price - b.price).map((company, i) => {
              const isCheapest = i === 0;
              const diff = cheapest ? company.price - cheapest.price : 0;
              return (
                <Link href={`/fuel/companies/${company.slug}`} key={company.slug} className={`px-6 py-4 flex items-center gap-4 ${isCheapest ? "bg-teal-50" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${isCheapest ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${company.colorDot}`} />
                      <span className={`font-bold text-sm ${isCheapest ? "text-teal-800" : "text-slate-800"}`}>{company.name}</span>
                      {isCheapest && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">ყველაზე იაფი</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-extrabold font-mono text-xl ${isCheapest ? "text-teal-700" : "text-slate-900"}`}>{company.price.toFixed(2)} ₾</div>
                    {diff > 0 && <div className="text-xs text-slate-400 font-mono">+{diff.toFixed(2)} ₾</div>}
                  </div>
                  <div className="hidden sm:block text-xs text-slate-400 w-20 text-right">{timeAgo(company.lastChecked)}</div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <AlertForm fuelType={type} />
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="text-xs text-slate-400">ფასი ბოლო 30 დღეში</div>
            <div className={`font-extrabold font-mono text-lg ${Number(summary?.change30d) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {summary?.change30d != null ? `${summary.change30d.toFixed(2)} ₾` : "—"}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-extrabold text-slate-900">საწვავის ფასის ისტორია</h3>
          <div className="flex gap-1">
            {["7d", "30d", "3m", "6m", "1y", "All"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${range === r ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pt-4 pb-2 h-64">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chart} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={38} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 12, fontSize: 12, color: "#fff" }} />
              {companies.map((c) =>
                active.includes(c.slug) ? <Line key={c.slug} type="monotone" dataKey={c.slug} stroke={c.chartColor} strokeWidth={2} dot={false} name={c.name} /> : null
              )}
              {active.includes("avg") && <Line type="monotone" dataKey="avg" stroke="#0d9488" strokeWidth={2.5} strokeDasharray="6 3" dot={false} name="საშუალო" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-7">
        <div className="flex justify-between mb-4">
          <h3 className="font-extrabold text-slate-900">საწვავის ქსელები</h3>
          <Link href="/fuel/map" className="text-sm text-teal-600 font-bold flex items-center gap-1">
            რუკა <IconChevronRight />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <Link key={c.slug} href={`/fuel/companies/${c.slug}`} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${c.colorDot} rounded-xl flex items-center justify-center font-extrabold text-white text-sm`}>
                  {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-6 h-6 object-contain" /> : c.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400">{timeAgo(c.lastChecked)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["regular", "premium", "diesel"].map((k) => (
                  <div key={k} className="bg-slate-50 rounded-xl py-2 px-1">
                    <div className="text-[10px] text-slate-400 font-medium">{k}</div>
                    <div className="font-extrabold text-slate-900 font-mono text-sm mt-0.5">{c.prices[k]?.toFixed(2) ?? "—"}</div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
