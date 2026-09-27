"use client";

import { useState } from "react";
import { toggleFavorite } from "@/lib/api";
import { IconHeart } from "@/components/Icons";

export default function FavoriteButton({ itemType, itemId }: { itemType: string; itemId: number }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => {
        toggleFavorite(itemType, itemId, on).catch(() => {});
        setOn(!on);
      }}
      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
    >
      <IconHeart filled={on} /> ფავორიტი
    </button>
  );
}
