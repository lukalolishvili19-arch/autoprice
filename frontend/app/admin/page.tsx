"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function AdminPage() {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [out, setOut] = useState("");
  const auth = "Basic " + (typeof btoa !== "undefined" ? btoa(`${user}:${pass}`) : "");
  async function call(path: string, method = "GET") {
    const r = await fetch(`${API_URL}${path}`, { method, headers: { Authorization: auth } });
    setOut(JSON.stringify(await r.json(), null, 2));
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-4">Admin</h1>
      <div className="flex gap-2 mb-4">
        <input className="border rounded-xl px-3 py-2 text-sm" value={user} onChange={(e) => setUser(e.target.value)} />
        <input type="password" className="border rounded-xl px-3 py-2 text-sm" placeholder="password" value={pass} onChange={(e) => setPass(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="px-3 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold" onClick={() => call("/api/admin/status")}>Status</button>
        <button className="px-3 py-2 bg-white border rounded-xl text-sm font-bold" onClick={() => call("/api/admin/stores")}>Stores</button>
        <button className="px-3 py-2 bg-white border rounded-xl text-sm font-bold" onClick={() => call("/api/admin/scrape-runs")}>Runs</button>
        <button className="px-3 py-2 bg-white border rounded-xl text-sm font-bold" onClick={() => call("/api/admin/scrape-errors")}>Errors</button>
        <button className="px-3 py-2 bg-white border rounded-xl text-sm font-bold" onClick={() => call("/api/admin/matches")}>Matches</button>
        <button className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold" onClick={() => call("/api/admin/collectors/fuel", "POST")}>Run fuel</button>
        <button className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold" onClick={() => call("/api/admin/collectors/products", "POST")}>Run products</button>
      </div>
      <pre className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs overflow-auto max-h-[480px]">{out}</pre>
    </div>
  );
}
