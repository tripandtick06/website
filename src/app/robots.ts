import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/_next", "/static", "/b2b", "/hesabim", "/davet"],
      },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      // Non-Google arama motorlari — explicit welcome (citation + crawl-rate icin).
      { userAgent: "YandexBot", allow: "/" },
      { userAgent: "YandexImages", allow: "/" },
      { userAgent: "Baiduspider", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Naverbot", allow: "/" },
      { userAgent: "Yeti", allow: "/" },
      { userAgent: "Seznambot", allow: "/" },
      // Ek AI/LLM crawler'lari.
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Google-CloudVertexBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
