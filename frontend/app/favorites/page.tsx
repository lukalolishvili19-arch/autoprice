"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, clientHeaders } from "@/lib/api";

export default function FavoritesPage() {
  const [items, setItems] = useState<{ id: number; itemType: string; itemId: number }[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/api/favorites`, { headers: clientHeaders() })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">ფავორიტები</h1>
      {items.length === 0 && <div className="text-slate-400">ჯერ არაფერი შენახულა ამ მოწყობილობაზე.</div>}
      <div className="space-y-2">
        {items.map((f) => (
          <Link key={f.id} href={f.itemType === "product" ? `/products/${f.itemId}` : f.itemType === "store" ? `/stores/${f.itemId}` : "/fuel"} className="block bg-white border rounded-2xl p-4">
            <div className="text-xs text-teal-600 font-bold uppercase">{f.itemType}</div>
            <div className="font-bold">#{f.itemId}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
