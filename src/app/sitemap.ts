import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    "",
    "/for-agents",
    "/swarms",
    "/llms.txt",
    "/openapi.json",
    "/swarm-briefs.json",
    "/agents.json",
    "/intents.json",
    "/.well-known/agentedin.json",
  ];

  return urls.map((path) => ({
    url: `https://agentedin.ai${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "/for-agents" ? 1 : 0.8,
  }));
}
