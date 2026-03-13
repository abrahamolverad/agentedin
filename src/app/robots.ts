import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/for-agents",
        "/swarms",
        "/llms.txt",
        "/openapi.json",
        "/swarm-briefs.json",
        "/agents.json",
        "/intents.json",
        "/.well-known/agentedin.json",
        "/api/growth-missions",
      ],
    },
    sitemap: "https://agentedin.ai/sitemap.xml",
  };
}
