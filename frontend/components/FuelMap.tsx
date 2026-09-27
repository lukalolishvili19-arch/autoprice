"use client";

import { useEffect, useRef } from "react";

type Station = {
  id: number;
  companyName: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function FuelMap({ stations }: { stations: Station[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || stations.length === 0) return;
    let map: import("leaflet").Map | null = null;
    (async () => {
      const L = await import("leaflet");
      if (!ref.current) return;
      const center = stations[0];
      map = L.map(ref.current).setView([center.latitude, center.longitude], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      for (const s of stations) {
        L.marker([s.latitude, s.longitude])
          .addTo(map!)
          .bindPopup(`<strong>${s.companyName}</strong><br/>${s.name}`);
      }
    })();
    return () => {
      map?.remove();
    };
  }, [stations]);

  if (stations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl h-80 flex items-center justify-center text-slate-400">
        რუკა ცარიელია — არ არის დადასტურებული კოორდინატები.
      </div>
    );
  }

  return <div ref={ref} className="bg-white border border-slate-200 rounded-2xl h-80 overflow-hidden" />;
}
