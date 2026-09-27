"use client";

import { useState } from "react";
import { createAlert } from "@/lib/api";

export default function AlertForm({ productId, fuelType }: { productId?: number; fuelType?: string }) {
  const [target, setTarget] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await createAlert({
          alertType: productId ? "product" : "fuel",
          productId,
          fuelType: fuelType || "regular",
          targetPrice: Number(target),
        });
        setOk(true);
      }}
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
    >
      <div className="font-bold text-amber-900 text-sm mb-1">ფასის შეტყობინება</div>
      <p className="text-xs text-amber-700 mb-3">შემატყობინე როცა ფასი ჩამოვა</p>
      <div className="flex gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          type="number"
          step="0.01"
          required
          placeholder="სამიზნე ₾"
          className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5"
        />
        <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg">ჩართვა</button>
      </div>
      {ok && <div className="text-xs text-emerald-700 mt-2">შეტყობინება ჩაირთო</div>}
    </form>
  );
}
