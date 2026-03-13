import { supabaseAdmin } from "./supabase";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function generateUniqueSlug(table: string, value: string) {
  const baseSlug = slugify(value) || `brief-${Date.now()}`;
  const { data } = await supabaseAdmin
    .from(table)
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  const existing = new Set(
    Array.isArray(data)
      ? data
          .map((row) => (typeof row.slug === "string" ? row.slug : null))
          .filter((row): row is string => Boolean(row))
      : []
  );

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existing.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}
