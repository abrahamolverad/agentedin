import { getOwnerPolicy, type OwnerPolicy } from "./autonomy";

const DEFAULT_FORBIDDEN_TOPICS = [
  "internal_strategy",
  "private_ideas",
  "credentials",
  "unreleased_products",
] as const;

const TOPIC_PATTERNS: Record<string, RegExp[]> = {
  internal_strategy: [
    /\b(internal strategy|go-to-market plan|launch plan|pricing strategy|internal roadmap)\b/i,
    /\b(confidential strategy|private roadmap|stealth plan)\b/i,
  ],
  private_ideas: [
    /\b(private idea|internal idea|brainstorm|secret concept|unpublished concept)\b/i,
    /\b(confidential concept|do not share|off the record)\b/i,
  ],
  credentials: [
    /\b(api key|secret key|token|password|bearer)\b/i,
    /\bsk-(proj-)?[a-z0-9_-]{20,}\b/i,
    /\bsb_(publishable|secret)_[a-z0-9_-]+\b/i,
    /\bagt_[a-z0-9]+_[a-z0-9]+\b/i,
  ],
  unreleased_products: [
    /\b(unreleased product|coming soon but private|not public yet|embargoed launch)\b/i,
    /\bunder wraps|pre-release only|prototype only\b/i,
  ],
};

function getPatterns(forbiddenTopics: string[]) {
  return forbiddenTopics.flatMap((topic) => TOPIC_PATTERNS[topic] ?? []);
}

export interface DisclosureCheckResult {
  ok: boolean;
  ownerPolicy: OwnerPolicy | null;
  violations: string[];
}

export async function checkPublicDisclosure(input: {
  ownerId?: string | null;
  fields: Array<string | null | undefined>;
}): Promise<DisclosureCheckResult> {
  const ownerPolicy = input.ownerId ? await getOwnerPolicy(input.ownerId) : null;
  const forbiddenTopics = Array.isArray(ownerPolicy?.forbidden_topics)
    ? ownerPolicy.forbidden_topics
    : [...DEFAULT_FORBIDDEN_TOPICS];

  const content = input.fields.filter(Boolean).join("\n");
  const violations: string[] = [];

  if (!content) {
    return { ok: true, ownerPolicy, violations };
  }

  for (const topic of forbiddenTopics) {
    const patterns = TOPIC_PATTERNS[topic] ?? [];
    if (patterns.some((pattern) => pattern.test(content))) {
      violations.push(topic);
    }
  }

  if (!violations.length) {
    const genericPatterns = getPatterns([...DEFAULT_FORBIDDEN_TOPICS]);
    if (genericPatterns.some((pattern) => pattern.test(content))) {
      violations.push("professional_boundary");
    }
  }

  return {
    ok: violations.length === 0,
    ownerPolicy,
    violations,
  };
}
