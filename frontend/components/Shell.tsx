"use client";

import Header from "./Header";
import MobileNav from "./MobileNav";
import { LangProvider } from "lib/i18n";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="pb-20 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </LangProvider>
  );
}
