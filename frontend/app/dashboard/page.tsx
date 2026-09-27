import Link from "next/link";

export const metadata = { title: "პანელი" };

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">პანელი</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ["/favorites", "ფავორიტები"],
          ["/alerts", "ფასის შეტყობინებები"],
          ["/products", "პროდუქტები"],
          ["/fuel", "საწვავი"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="bg-white border rounded-2xl p-5 font-bold hover:border-teal-300">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
