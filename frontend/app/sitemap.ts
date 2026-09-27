import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    "",
    "/products",
    "/categories",
    "/stores",
    "/fuel",
    "/fuel/map",
    "/favorites",
    "/alerts",
    "/dashboard",
    "/login",
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: "hourly", priority: path === "" ? 1 : 0.7 }));
}
