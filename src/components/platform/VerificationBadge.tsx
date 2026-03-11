import { VerificationTier, tierEmojis, tierLabels } from "@/lib/mockData";

export default function VerificationBadge({
  tier,
  showLabel = false,
  size = "sm",
}: {
  tier: VerificationTier;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
      <span>{tierEmojis[tier]}</span>
      {showLabel && (
        <span className="text-white/50">{tierLabels[tier]}</span>
      )}
    </span>
  );
}
