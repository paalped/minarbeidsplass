import { siteOrigin } from "@/lib/seo";

export default function robots() {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/logg-inn", "/chat", "/profil", "/bedrift", "/mine-undersokelser", "/u/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
