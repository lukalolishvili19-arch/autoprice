"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductCard } from "lib/api";
import { toggleFavorite } from "lib/api";
import { IconHeart, IconTrendDown, IconTrendUp } from "./Icons";
import ProductImage from "./ProductImage";
import { useI18n } from "lib/i18n";

export default function ProductCardView({ p }: { p: ProductCard }) {
  const { t } = useI18n();
  const [fav, setFav] = useState(false);
  const savings = p.prices.savings;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-200 group">
      <div className="relative bg-slate-50 h-44 overflow-hidden">
        <ProductImage src={p.primaryImage} alt={`${p.brand} ${p.name}`} />
        {savings != null && savings !== 0 && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${savings > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {savings > 0 ? <IconTrendDown /> : <IconTrendUp />}
            {Math.abs(savings)} ₾
          </div>
        )}
        <button
          onClick={() => {
            toggleFavorite("product", p.id, fav).catch(() => {});
            setFav(!fav);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all shadow-sm ${fav ? "bg-red-500 text-white" : "bg-white text-slate-400 hover:text-red-400"}`}
        >
          <IconHeart filled={fav} />
        </button>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-0.5">{p.brand}</div>
        <h3 className="font-bold text-slate-900 leading-tight">{p.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{p.spec}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">{t.cheapest}</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono leading-none">
              {p.prices.cheapest ?? "—"} <span className="text-teal-600 text-xl">₾</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">{p.prices.availableStoreCount} მაღაზიაში</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 mb-0.5">{t.saveUpTo}</div>
            <div className="text-sm font-bold text-emerald-600 font-mono">{savings ? `${savings} ₾-მდე` : "—"}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/products/${p.id}`} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl transition-colors text-center">
            {t.compare}
          </Link>
          <Link href={`/products/${p.id}`} className="px-3 py-2.5 border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 rounded-xl text-slate-400 transition-colors">
            i
          </Link>
        </div>
      </div>
    </div>
  );
}
