import { getNews, getRankings, getRecentCompanies, getSurveys } from "@/lib/data";
import { pageUrl } from "@/lib/seo";

export default async function sitemap() {
  const now = new Date();
  const [news, rankings, companies, surveys] = await Promise.all([
    getNews(100),
    getRankings(200),
    getRecentCompanies(500),
    getSurveys(),
  ]);

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/bedrifter", changeFrequency: "daily", priority: 0.9 },
    { path: "/karing", changeFrequency: "daily", priority: 0.9 },
    { path: "/undersokelse", changeFrequency: "weekly", priority: 0.9 },
    { path: "/nyheter", changeFrequency: "weekly", priority: 0.7 },
  ].map((route) => ({
    url: pageUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const surveyRoutes = surveys.map((survey) => ({
    url: pageUrl(`/undersokelse/${survey.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const newsRoutes = news.map((article) => ({
    url: pageUrl(`/nyheter/${article.slug}`),
    lastModified: article.published_at ? new Date(article.published_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const seen = new Set();
  const companyRoutes = [];
  for (const row of [...rankings, ...companies]) {
    if (!row?.orgnr || seen.has(row.orgnr)) continue;
    seen.add(row.orgnr);
    companyRoutes.push({
      url: pageUrl(`/bedrifter/${row.orgnr}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return [...staticRoutes, ...surveyRoutes, ...newsRoutes, ...companyRoutes];
}
