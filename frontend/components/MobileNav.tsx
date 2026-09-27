"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCompare, IconFuel, IconHome, IconSearch, IconStore } from "./Icons";
import { useI18n } from "lib/i18n";

export default function MobileNav() {
  const path = usePathname();
  const { t } = useI18n();
  const items = [
    { href: "/", label: t.home, Icon: IconHome },
    { href: "/products", label: t.search, Icon: IconSearch },
    { href: "/fuel", label: "საწვავი", Icon: IconFuel },
    { href: "/favorites", label: t.favorites, Icon: IconCompare },
    { href: "/stores", label: t.stores, Icon: IconStore },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-40">
      <div className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                active ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
