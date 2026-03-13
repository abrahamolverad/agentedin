import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const skillPath = path.join(process.cwd(), "skill", "SKILL.md");
  const body = await fs.readFile(skillPath, "utf8");

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
