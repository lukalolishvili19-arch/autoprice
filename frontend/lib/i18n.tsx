"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ka" | "en";

const dict = {
  ka: {
    home: "მთავარი",
    products: "პროდუქტები",
    fuel: "საწვავის ფასები",
    compare: "შედარება",
    stores: "მაღაზიები",
    search: "ძებნა",
    favorites: "ფავორიტები",
    alerts: "შეტყობინებები",
    dashboard: "პანელი",
    login: "შესვლა",
    profile: "პროფილი",
    cheapest: "ყველაზე იაფი",
    unavailable: "არ არის ხელმისაწვდომი",
    available: "ხელმისაწვდომია",
    saveUpTo: "დაზოგავ",
    updated: "განახლდა",
    empty: "პროდუქტი ვერ მოიძებნა",
    emptyHint: "სცადე სხვა საძიებო სიტყვა",
    all: "ყველა",
    heroTitle1: "იპოვე",
    heroBest: "საუკეთესო",
    heroTitle2: "ფასი ავტომობილისთვის",
    heroSub: "შეადარე ავტოპროდუქტებისა და საწვავის ფასები საქართველოს მასშტაბით ერთ ადგილას.",
    live: "ფასები განახლდება რეგულარულად",
    searchPh: "მოძებნე პროდუქტი, ზეთი, აკუმულატორი...",
    mapTitle: "საწვავი ჩემთან ახლოს",
    noCoords: "სადგურის კოორდინატები ჯერ არ არის დადასტურებული წყაროდან.",
    loginTitle: "ანგარიშში შესვლა",
    loginHint: "ფავორიტები ამ მოწყობილობაზე ინახება. სრული ანგარიში მალე.",
  },
  en: {
    home: "Home",
    products: "Products",
    fuel: "Fuel prices",
    compare: "Compare",
    stores: "Stores",
    search: "Search",
    favorites: "Favorites",
    alerts: "Alerts",
    dashboard: "Dashboard",
    login: "Log in",
    profile: "Profile",
    cheapest: "Cheapest",
    unavailable: "Unavailable",
    available: "Available",
    saveUpTo: "Save up to",
    updated: "Updated",
    empty: "No products found",
    emptyHint: "Try a different search",
    all: "All",
    heroTitle1: "Find the",
    heroBest: "best",
    heroTitle2: "price for your car",
    heroSub: "Compare auto products and fuel prices across Georgia in one place.",
    live: "Prices update regularly",
    searchPh: "Search product, oil, battery...",
    mapTitle: "Fuel near me",
    noCoords: "Station coordinates are only shown when a source provides them.",
    loginTitle: "Sign in",
    loginHint: "Favorites are stored on this device. Full accounts coming soon.",
  },
} as const;

type Messages = Record<keyof typeof dict.ka, string>;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Messages }>({
  lang: "ka",
  setLang: () => {},
  t: dict.ka,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ka");
  useEffect(() => {
    const s = localStorage.getItem("ap-lang") as Lang | null;
    if (s === "en" || s === "ka") setLangState(s);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ap-lang", l);
    document.documentElement.lang = l === "ka" ? "ka" : "en";
  };
  return <Ctx.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
