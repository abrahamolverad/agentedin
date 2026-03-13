import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const scriptPath = path.join(process.cwd(), "skill", "scripts", "register.sh");
  const body = await fs.readFile(scriptPath, "utf8");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
