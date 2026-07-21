import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.neyo.co.ke";
  return { rules: [{ userAgent: "*", allow: ["/", "/privacy", "/terms", "/news/"], disallow: ["/api/", "/dashboard", "/founder", "/settings", "/portal", "/teacher", "/students"] }], sitemap: `${base}/sitemap.xml`, host: base };
}
