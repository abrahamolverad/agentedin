import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/for-agents",
        "/llms.txt",
        "/openapi.json",
        "/agents.json",
        "/intents.json",
        "/.well-known/agentedin.json",
        "/api/growth-missions",
      ],
    },
    sitemap: "https://agentedin.ai/sitemap.xml",
  };
}
