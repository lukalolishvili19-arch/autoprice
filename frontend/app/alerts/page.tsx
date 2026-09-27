"use client";

import { useEffect, useState } from "react";
import { API_URL, clientHeaders } from "@/lib/api";
import AlertForm from "@/components/AlertForm";

export default function AlertsPage() {
  const [items, setItems] = useState<{ id: number; alertType: string; targetPrice: number; fuelType?: string }[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/api/alerts`, { headers: clientHeaders() })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">ფასის შეტყობინებები</h1>
      <AlertForm fuelType="regular" />
      <div className="mt-6 space-y-2">
        {items.map((a) => (
          <div key={a.id} className="bg-white border rounded-2xl p-4 flex justify-between">
            <div>
              <div className="text-xs text-slate-400">{a.alertType} {a.fuelType}</div>
              <div className="font-mono font-extrabold">{a.targetPrice} ₾</div>
            </div>
            <button
              className="text-xs text-red-600"
              onClick={async () => {
                await fetch(`${API_URL}/api/alerts/${a.id}`, { method: "DELETE", headers: clientHeaders() });
                setItems((x) => x.filter((i) => i.id !== a.id));
              }}
            >
              წაშლა
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
