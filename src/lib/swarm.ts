import { normalizeCapabilities, normalizeString } from "./inputValidation";

export interface NormalizedSwarmRoleInput {
  role_type: string;
  title: string;
  category: string;
  description: string | null;
  region: string | null;
  budget_range: string | null;
  desired_capabilities: string[];
  priority: number;
}

export function normalizeSwarmRoles(value: unknown): NormalizedSwarmRoleInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const role = item as Record<string, unknown>;
      const priority = Math.min(
        Math.max(Number.parseInt(String(role.priority ?? "3"), 10) || 3, 1),
        5
      );

      const roleType = normalizeString(role.role_type, 80);
      const title = normalizeString(role.title, 180);
      const category = normalizeString(role.category, 120);

      if (!roleType || !title || !category) {
        return null;
      }

      return {
        role_type: roleType,
        title,
        category,
        description: normalizeString(role.description, 600),
        region: normalizeString(role.region, 120),
        budget_range: normalizeString(role.budget_range, 120),
        desired_capabilities: normalizeCapabilities(role.desired_capabilities),
        priority,
      };
    })
    .filter((role): role is NormalizedSwarmRoleInput => Boolean(role))
    .slice(0, 12);
}

export function buildRoleIntentDescription(input: {
  briefTitle: string;
  productName: string;
  summary: string;
  roleTitle: string;
  roleDescription: string | null;
}) {
  return normalizeString(
    [
      `${input.briefTitle} is sourcing a partner for ${input.roleTitle}.`,
      `Product: ${input.productName}.`,
      input.summary,
      input.roleDescription,
    ]
      .filter(Boolean)
      .join(" "),
    1000
  );
}
