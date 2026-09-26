import { useTranslation } from "next-i18next";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type VoteTallyProps = {
  upCount: number;
  downCount: number;
  className?: string;
};

export const VoteTally = ({ upCount, downCount, className }: VoteTallyProps) => {
  const { t } = useTranslation();

  if (upCount <= 0 && downCount <= 0) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {t("vote-tally-no-votes")}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-3 text-sm", className)}
      aria-label={t("vote-tally-aria", { upCount, downCount })}
    >
      {upCount > 0 ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ThumbsUpIcon className="size-4" aria-hidden />
          <span className="font-semibold tabular-nums">{upCount}</span>
        </span>
      ) : null}
      {downCount > 0 ? (
        <span className="inline-flex items-center gap-1 text-destructive">
          <ThumbsDownIcon className="size-4" aria-hidden />
          <span className="font-semibold tabular-nums">{downCount}</span>
        </span>
      ) : null}
    </span>
  );
};
