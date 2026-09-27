import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "საწვავის ფასები",
  description: "შეადარე საწვავის მიმდინარე ფასები საქართველოში",
  alternates: { canonical: "/fuel" },
};

export default function FuelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
