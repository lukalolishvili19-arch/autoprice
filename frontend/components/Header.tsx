"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconBell, IconCompare, IconMenu, IconSearch } from "./Icons";
import { useI18n } from "lib/i18n";
import { api, type SearchHit } from "lib/api";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-teal-500 transition-colors">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="text-left">
        <div className="font-extrabold text-slate-900 text-sm leading-none tracking-tight">AutoPrice</div>
        <div className="text-teal-600 text-xs font-semibold leading-none mt-0.5 tracking-wide">საქართველო</div>
      </div>
    </Link>
  );
}

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const nav = [
    { href: "/", id: "home", label: t.home },
    { href: "/products", id: "products", label: t.products },
    { href: "/fuel", id: "fuel", label: t.fuel },
    { href: "/products", id: "compare", label: t.compare },
    { href: "/stores", id: "stores", label: t.stores },
  ];

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const tmr = setTimeout(() => {
      api.search(q).then(setHits).catch(() => setHits([]));
    }, 200);
    return () => clearTimeout(tmr);
  }, [q]);

  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-0.5">
            {nav.map((item) => {
              const active = item.href === "/" ? path === "/" : path.startsWith(item.href) && item.id !== "compare";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <IconSearch />
                <span className="hidden md:inline text-sm">{t.search}</span>
              </button>
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(`/products?q=${encodeURIComponent(q)}`);
                        setSearchOpen(false);
                      }
                    }}
                    placeholder={t.searchPh}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="mt-2 max-h-64 overflow-auto">
                    {hits.map((h) => (
                      <Link
                        key={h.id}
                        href={`/products/${h.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                          {h.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={h.image} alt="" className="w-full h-full object-contain" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-teal-600 font-bold">{h.brand}</div>
                          <div className="text-sm font-semibold text-slate-900 truncate">{h.name}</div>
                          {h.cheapest != null && (
                            <div className="text-xs font-mono text-slate-500">{h.cheapest} ₾</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/alerts" className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
              <IconBell />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full" />
            </Link>
            <button
              onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              className="hidden sm:flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors tracking-widest"
            >
              {lang === "ka" ? "GE" : "EN"}
            </button>
            <Link href="/login" className="hidden sm:flex w-8 h-8 bg-slate-200 rounded-full items-center justify-center hover:bg-slate-300 transition-colors">
              <span className="text-xs font-bold text-slate-600">გ</span>
            </Link>
            <button className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
              <IconMenu open={mobileOpen} />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 py-2 pb-3 space-y-0.5">
            {nav.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
