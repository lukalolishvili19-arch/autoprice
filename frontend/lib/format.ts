export function gel(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toFixed(digits)} ₾`;
}

export function timeAgo(iso: string | null | undefined, lang: "ka" | "en" = "ka") {
  if (!iso) return lang === "ka" ? "უცნობი" : "unknown";
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (lang === "en") {
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    if (h < 24) return `${h} h ago`;
    return `${d} d ago`;
  }
  if (m < 1) return "ახლახანს";
  if (m < 60) return `${m} წთ წინ`;
  if (h < 24) return `${h} სთ წინ`;
  return `${d} დღის წინ`;
}
