import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: { default: "AutoPrice საქართველო", template: "%s · AutoPrice" },
  description: "შეადარე ავტოპროდუქტებისა და საწვავის ფასები საქართველოს მასშტაბით ერთ ადგილას.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "AutoPrice საქართველო",
    description: "ავტოპროდუქტებისა და საწვავის ფასების შედარება",
    locale: "ka_GE",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body className="font-sans antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
